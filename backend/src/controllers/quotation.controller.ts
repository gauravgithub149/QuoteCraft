import { Response } from "express";
import mongoose from "mongoose";
import { Quotation } from "../models/Quotation";
import { AuthRequest } from "../middleware/auth.middleware";
import { Customer } from "../models/Customer";
import { recalculateCustomerTotals } from "../utils/customerTotals";

const getOwnerId = (req: AuthRequest): string | null => {
  if (!req.user) {
    return null;
  }

  // Owner's workspace is their own ID
  if (req.user.role === "owner") {
    return req.user.userId;
  }

  // Staff belongs to owner's workspace
  return req.user.ownerId || null;
};
// GET ALL QUOTATIONS
export const getQuotations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(403).json({
        success: false,
        message: "Workspace owner not found.",
      });
    }

    const quotations = await Quotation.find({
      ownerId,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: quotations.length,
      data: quotations,
    });
  } catch (error: any) {
    console.error("Get quotations error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch quotations",
    });
  }
};

// GET QUOTATION BY ID
export const getQuotationById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(403).json({
        success: false,
        message: "Workspace owner not found.",
      });
    }

    const quotation = await Quotation.findOne({
      _id: req.params.id,
      ownerId,
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found in your workspace.",
      });
    }

    return res.json({
      success: true,
      data: quotation,
    });
  } catch (error: any) {
    console.error("Get quotation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch quotation.",
    });
  }
};

// CREATE QUOTATION
export const createQuotation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const {
      quoteNumber,
      customerId,
      customerName,
      customerCompany,
      customerEmail,
      customerAddress,
      date,
      validUntil,
      items,
      subtotal,
      discount,
      tax,
      grandTotal,
      notes,
      terms,
      preparedBy,
    } = req.body;

    if (!quoteNumber) {
      return res.status(400).json({
        success: false,
        message: "Quote number is required",
      });
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one quotation item is required",
      });
    }

    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(403).json({
        success: false,
        message: "Workspace owner not found.",
      });
    }
    const customer = await Customer.findOne({
      _id: customerId,
      ownerId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found in your workspace.",
      });
    }

    const quotation = await Quotation.create({
      userId: req.user.userId,
      ownerId,

      quoteNumber,

      customerId,
      customerName,
      customerCompany,
      customerEmail,
      customerAddress,

      date,
      validUntil,

      items,

      subtotal: subtotal || 0,
      discount: discount || 0,
      tax: tax || 0,
      grandTotal: grandTotal || 0,

      status: "Draft",

      notes: notes || "",

      terms: terms || "Payment due as per agreed quotation terms.",

      preparedBy: preparedBy || req.user.email,

      auditTrail: [
        {
          id: `at-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: "Quotation Created",
          user: req.user.email,
          notes: "Quotation created successfully",
        },
      ],
    });
    await recalculateCustomerTotals(customerId);

    return res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      data: quotation,
    });
  } catch (error: any) {
    console.error("Create quotation error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.code === 11000
          ? "Quote number already exists"
          : error.message || "Failed to create quotation",
    });
  }
};

// UPDATE QUOTATION

// UPDATE QUOTATION
export const updateQuotation = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(403).json({
        success: false,
        message: "Workspace owner not found.",
      });
    }

    const {
      quoteNumber,
      customerId,
      customerName,
      customerCompany,
      customerEmail,
      customerAddress,
      date,
      validUntil,
      items,
      subtotal,
      discount,
      tax,
      grandTotal,
      notes,
      terms,
      preparedBy,
    } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    // Check customer belongs to same workspace
    const customer = await Customer.findOne({
      _id: customerId,
      ownerId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found in your workspace.",
      });
    }

    // Get existing quotation first
    const existingQuotation = await Quotation.findOne({
      _id: req.params.id,
      ownerId,
    });

    if (!existingQuotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found in your workspace.",
      });
    }

    // Remember old customer
    const oldCustomerId = existingQuotation.customerId;

    const updateData = {
      quoteNumber,
      customerId,
      customerName,
      customerCompany,
      customerEmail,
      customerAddress,
      date,
      validUntil,
      items,
      subtotal,
      discount,
      tax,
      grandTotal,
      notes,
      terms,
      preparedBy,
    };

    const quotation = await Quotation.findOneAndUpdate(
      {
        _id: req.params.id,
        ownerId,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found in your workspace.",
      });
    }

    // Recalculate new customer's totals
    await recalculateCustomerTotals(customerId);

    // If customer was changed, recalculate old customer's totals too
    if (oldCustomerId.toString() !== customerId.toString()) {
      await recalculateCustomerTotals(oldCustomerId);
    }

    return res.json({
      success: true,
      message: "Quotation updated successfully.",
      data: quotation,
    });
  } catch (error: any) {
    console.error("Update quotation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update quotation.",
    });
  }
};

// UPDATE STATUS
export const updateQuotationStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (req.user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only the owner can change quotation status.",
      });
    }

    const { status, note } = req.body;

    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(403).json({
        success: false,
        message: "Workspace owner not found.",
      });
    }

    const quotation = await Quotation.findOne({
      _id: req.params.id,
      ownerId,
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message:
          "Quotation not found or you do not have permission to update its status",
      });
    }

    quotation.status = status;

    quotation.auditTrail.push({
      id: `at-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Status changed to ${status}`,
      user: req.user.email,
      notes: note || "",
    });

    await quotation.save();

    return res.json({
      success: true,
      message: "Quotation status updated",
      data: quotation,
    });
  } catch (error: any) {
    console.error("Update quotation status error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update quotation status or you do not have permission to update it",
    });
  }
};

// DELETE QUOTATION
export const deleteQuotation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(403).json({
        success: false,
        message: "Workspace owner not found.",
      });
    }

    const deleteFilter: any = {
      _id: req.params.id,
      ownerId,
    };

    // Staff can delete only quotations created by themselves.
    if (req.user.role === "staff") {
      deleteFilter.userId = req.user.userId;
    }

    const quotation = await Quotation.findOneAndDelete(deleteFilter);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }
    await recalculateCustomerTotals(quotation.customerId);

    return res.json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete quotation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete quotation",
    });
  }
};
