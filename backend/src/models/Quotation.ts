import mongoose, { Schema, Document } from "mongoose";

export type QuoteStatus =
  | "Draft"
  | "Sent"
  | "Accepted"
  | "Rejected"
  | "Expired";

export interface ILineItem {
  id: string;

  productId?: mongoose.Types.ObjectId;

  description: string;

  qty: number;
  unitPrice: number;
  amount: number;

  category: "Hardware" | "Software" | "Services" | "Support" | "Consulting";

  billingUnit?: "Unit" | "Hour" | "Day" | "Project" | "Month" | "Session";
}

export interface IQuotation extends Document {
  quoteNumber: string;

  userId: mongoose.Types.ObjectId;

  // Workspace owner
  ownerId: mongoose.Types.ObjectId;

  customerId: mongoose.Types.ObjectId;

  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerAddress: string;

  date: string;
  validUntil: string;

  items: ILineItem[];

  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;

  status: QuoteStatus;

  notes?: string;
  terms?: string;
  preparedBy: string;

  auditTrail: IAuditTrail[];
}

export interface IAuditTrail {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  notes?: string;
}

export interface IQuotation extends Document {
  quoteNumber: string;

  userId: mongoose.Types.ObjectId;

  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerAddress: string;

  date: string;
  validUntil: string;

  items: ILineItem[];

  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;

  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";

  notes?: string;
  terms?: string;
  preparedBy: string;

  auditTrail: IAuditTrail[];
}

const QuotationSchema = new Schema<IQuotation>(
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

    quoteNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerCompany: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      default: "",
      trim: true,
    },

    customerAddress: {
      type: String,
      default: "",
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    validUntil: {
      type: String,
      required: true,
    },

    items: [
      {
        id: {
          type: String,
          required: true,
        },

        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },

        description: {
          type: String,
          required: true,
        },

        qty: {
          type: Number,
          required: true,
          min: 1,
        },

        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },

        amount: {
          type: Number,
          required: true,
          min: 0,
        },

        category: {
          type: String,
          enum: ["Hardware", "Software", "Services", "Support", "Consulting"],
          required: true,
        },

        billingUnit: {
          type: String,
          enum: ["Unit", "Hour", "Day", "Project", "Month", "Session"],
          default: "Unit",
        },
      },
    ],

    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Draft", "Sent", "Accepted", "Rejected", "Expired"],
      default: "Draft",
    },

    notes: {
      type: String,
      default: "",
    },

    terms: {
      type: String,
      default: "Payment due as per agreed quotation terms.",
    },

    preparedBy: {
      type: String,
      default: "QuoteCraft",
    },

    auditTrail: [
      {
        id: String,
        timestamp: String,
        action: String,
        user: String,
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Quotation =
  mongoose.models.Quotation ||
  mongoose.model<IQuotation>("Quotation", QuotationSchema);
