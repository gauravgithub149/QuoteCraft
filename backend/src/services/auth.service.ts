import User, { IUser } from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  address?: string;
  taxId?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

class AuthService {
  // ==========================
  // Register User
  // ==========================

  async register(data: RegisterPayload) {
    const { name, email, password, companyName, address, taxId } = data;

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      throw new Error("User already exists.");
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,

      companyName: companyName || "",
      address: address || "",
      taxId: taxId || "",

      // Important
      role: "owner",
      status: "active",
      ownerId: null,
    });

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      ownerId: user._id.toString(),
    };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
      user,
    };
  }

  // ==========================
  // Login
  // ==========================

  async login(data: LoginPayload) {
    const { email, password } = data;

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }
    if (user.status === "inactive") {
      throw new Error(
        "Your account is inactive. Please contact the account owner.",
      );
    }

    user.lastActive = new Date();
    await user.save();

    const ownerId =
      user.role === "owner" ? user._id.toString() : user.ownerId?.toString();

    if (!ownerId) {
      throw new Error("User is not associated with an owner.");
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      ownerId,
    };

    // ==========================================
    // Build profile with workspace information
    // ==========================================

    let profileUser = user.toObject();

    if (user.role === "staff") {
      const owner = await User.findById(user.ownerId);

      if (!owner) {
        throw new Error("Workspace owner not found.");
      }

      profileUser = {
        ...profileUser,

        // Staff information
        name: user.name,
        email: user.email,
        role: user.role,
        ownerId: user.ownerId,

        // Workspace/owner information
        companyName: owner.companyName,
        address: owner.address,
        taxId: owner.taxId,
      };
    }

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
      user: profileUser,
    };
  }

  // ==========================
  // Get Profile
  // ==========================

  async getProfile(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    // Owner → use their own company information
    if (user.role === "owner") {
      return user;
    }

    // Staff → get company information from workspace owner
    if (user.role === "staff") {
      if (!user.ownerId) {
        throw new Error("Staff user is not associated with an owner.");
      }

      const owner = await User.findById(user.ownerId);

      if (!owner) {
        throw new Error("Workspace owner not found.");
      }

      return {
        ...user.toObject(),

        // Staff's personal information
        name: user.name,
        email: user.email,
        role: user.role,
        ownerId: user.ownerId,

        // Owner/workspace information
        companyName: owner.companyName,
        address: owner.address,
        taxId: owner.taxId,
      };
    }

    return user;
  }
  // ==========================
  // Update Profile
  // ==========================

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      email?: string;
      companyName?: string;
      address?: string;
      taxId?: string;
    },
  ) {
    const { name, email, companyName, address, taxId } = data;

    if (!name?.trim()) {
      throw new Error("Name is required.");
    }

    if (!email?.trim()) {
      throw new Error("Email is required.");
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new Error("Email is already in use.");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        companyName: companyName?.trim() || "",
        address: address?.trim() || "",
        taxId: taxId?.trim() || "",
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      throw new Error("User not found.");
    }

    return user;
  }
}

export default new AuthService();
