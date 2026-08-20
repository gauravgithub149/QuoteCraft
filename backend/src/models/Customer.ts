import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  // User who created the customer
  userId: mongoose.Types.ObjectId;

  // Owner/workspace this customer belongs to
  ownerId: mongoose.Types.ObjectId;

  name: string;
  company: string;
  email: string;
  phone: string;
  role: string;

  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;

  taxId: string;

  totalQuotesCount: number;
  totalValue: number;

  status: "Active" | "Lead" | "Inactive";

  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    // User who actually created the customer
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Owner/workspace
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    zip: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "",
      trim: true,
    },

    taxId: {
      type: String,
      default: "",
      trim: true,
    },

    totalQuotesCount: {
      type: Number,
      default: 0,
    },

    totalValue: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Lead", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

export const Customer =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
