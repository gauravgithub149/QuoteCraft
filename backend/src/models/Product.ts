import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  // User who created the product
  userId: mongoose.Types.ObjectId;

  // Owner/workspace this product belongs to
  ownerId: mongoose.Types.ObjectId;
  type: "Product" | "Service";

  name: string;
  sku: string;

  category: "Hardware" | "Software" | "Services" | "Support" | "Consulting";

  description: string;

  unitPrice: number;
  costPrice: number;

  taxStatus: "Taxable" | "Exempt" | "Zero-rated";

  stockLevel: number | "Unlimited";

  billingUnit?: "Hour" | "Day" | "Project" | "Month" | "Session";

  status: "Active" | "Low Stock" | "Draft" | "Inactive";

}
const ProductSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["Product", "Service"],
      default: "Product",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["Hardware", "Software", "Services", "Support", "Consulting"],
      default: "Hardware",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    unitPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
    },

    taxStatus: {
      type: String,
      enum: ["Taxable", "Exempt", "Zero-rated"],
      default: "Taxable",
    },

    stockLevel: {
      type: Schema.Types.Mixed,
      default: "Unlimited",
    },
    billingUnit: {
      type: String,
      enum: ["Hour", "Day", "Project", "Month", "Session"],
      default: "Hour",
    },

    status: {
      type: String,
      enum: ["Active", "Low Stock", "Draft", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
