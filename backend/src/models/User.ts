import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  role: "owner" | "staff";
  status: "active" | "inactive";

  companyName: string;
  address: string;
  taxId: string;

  avatarUrl: string;

  ownerId?: mongoose.Types.ObjectId | null;

  lastActive?: Date;

  createdAt?: Date;
  updatedAt?: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    // =========================
    // Basic Information
    // =========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    // =========================
    // Role
    // =========================

    role: {
      type: String,
      enum: ["owner", "staff"],
      default: "owner",
      required: true,
    },

    // =========================
    // Account Status
    // =========================

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },

    // =========================
    // Company Information
    // =========================

    companyName: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    taxId: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // Profile
    // =========================

    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // Owner / Organization
    // =========================
    
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // =========================
    // Activity
    // =========================

    lastActive: {
      type: String,
      default: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// Password Hashing
// ========================================

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// ========================================
// Compare Password
// ========================================

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);