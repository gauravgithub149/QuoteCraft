import User from "../models/User";
import mongoose from "mongoose";
interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  status?: "active" | "inactive";
}

interface UpdateStaffPayload {
  name?: string;
  email?: string;
  status?: "active" | "inactive";
}

const formatStaffUser = (user: any) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  companyName: user.companyName,
  address: user.address,
  taxId: user.taxId,
  avatarUrl: user.avatarUrl,
  lastActive: user.lastActive,
  ownerId: user.ownerId?.toString(),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
class UserService {
  // ==========================================
  // GET ALL STAFF FOR CURRENT OWNER
  // ==========================================

  async getStaffUsers(ownerId: string) {
    const users = await User.find({
      role: "staff",
      ownerId,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return users.map(formatStaffUser);
  }

  // ==========================================
  // GET SINGLE STAFF
  // ==========================================

  async getStaffUser(ownerId: string, staffId: string) {
    const user = await User.findOne({
      _id: staffId,
      role: "staff",
      ownerId,
    }).select("-password");

    if (!user) {
      throw new Error("Staff member not found.");
    }

    return formatStaffUser(user);
  }

  // ==========================================
  // CREATE STAFF
  // ==========================================

  async createStaff(ownerId: string, data: CreateStaffPayload) {
    const { name, email, password, status } = data;

    if (!name?.trim()) {
      throw new Error("Name is required.");
    }

    if (!email?.trim()) {
      throw new Error("Email is required.");
    }

    if (!password) {
      throw new Error("Password is required.");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Email must be globally unique
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      throw new Error("A user with this email already exists.");
    }

    const staff = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,

      role: "staff",

      // Use status sent by frontend
      status: status || "active",

      ownerId,

      companyName: "",
      address: "",
      taxId: "",
      avatarUrl: "",
    });

    const createdStaff = await User.findById(staff._id).select("-password");

    if (!createdStaff) {
      throw new Error("Failed to fetch created staff member.");
    }

    return formatStaffUser(createdStaff);
  }

  // ==========================================
  // UPDATE STAFF
  // ==========================================

  async updateStaff(
    ownerId: string,
    staffId: string,
    data: UpdateStaffPayload,
  ) {
    const updateData: UpdateStaffPayload = {};

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new Error("Name cannot be empty.");
      }

      updateData.name = data.name.trim();
    }

    if (data.email !== undefined) {
      if (!data.email.trim()) {
        throw new Error("Email cannot be empty.");
      }

      const normalizedEmail = data.email.toLowerCase().trim();

      // Check whether another user already uses this email
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: staffId },
      });

      if (existingUser) {
        throw new Error("A user with this email already exists.");
      }

      updateData.email = normalizedEmail;
    }

    if (data.status !== undefined) {
      if (!["active", "inactive"].includes(data.status)) {
        throw new Error("Invalid status.");
      }

      updateData.status = data.status;
    }

    const staff = await User.findOneAndUpdate(
      {
        _id: staffId,

        // Security checks
        role: "staff",
        ownerId,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!staff) {
      throw new Error("Staff member not found.");
    }

    return formatStaffUser(staff);
  }

  // ==========================================
  // UPDATE STAFF STATUS
  // ==========================================

  async updateStaffStatus(
    ownerId: string,
    staffId: string,
    status: "active" | "inactive",
  ) {
    if (!["active", "inactive"].includes(status)) {
      throw new Error('Status must be "active" or "inactive".');
    }

    const staff = await User.findOneAndUpdate(
      {
        _id: staffId,

        // Security checks
        role: "staff",
        ownerId,
      },
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!staff) {
      throw new Error("Staff member not found.");
    }

    return staff;
  }

  // ==========================================
  // DELETE STAFF
  // ==========================================

  async deleteStaff(ownerId: string, staffId: string) {
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      throw new Error("Invalid staff user ID.");
    }

    const staff = await User.findOneAndDelete({
      _id: staffId,
      role: "staff",
      ownerId,
    });

    if (!staff) {
      throw new Error("Staff member not found.");
    }

    return staff;
  }
}

export default new UserService();
