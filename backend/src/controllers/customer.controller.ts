import { Response } from "express";
import { Customer } from "../models/Customer";
import { AuthRequest } from "../middleware/auth.middleware";

const getOwnerId = (req: AuthRequest): string | null => {
  if (!req.user) {
    return null;
  }

  // Owner's workspace is their own ID
  if (req.user.role === "owner") {
    return req.user.userId;
  }

  // Staff belongs to the owner's workspace
  return req.user.ownerId || null;
};

// ==========================================
// GET ALL CUSTOMERS
// ==========================================

export const getCustomers = async (req: AuthRequest, res: Response) => {
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

    const customers = await Customer.find({
      ownerId,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error: any) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch customers",
    });
  }
};

// ==========================================
// GET CUSTOMER BY ID
// ==========================================

export const getCustomerById = async (req: AuthRequest, res: Response) => {
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

    const customer = await Customer.findOne({
      _id: req.params.id,
      ownerId,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    console.error("Get customer error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch customer",
    });
  }
};

// ==========================================
// CREATE CUSTOMER
// ==========================================

export const createCustomer = async (req: AuthRequest, res: Response) => {
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
      name,
      company,
      email,
      phone,
      role,
      address,
      city,
      state,
      zip,
      country,
      taxId,
      status,
    } = req.body;

    if (!name?.trim() || !company?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Contact name and company name are required",
      });
    }

    const customer = await Customer.create({
      // User who created the customer
      userId: req.user.userId,

      // Workspace owner
      ownerId,

      name: name.trim(),
      company: company.trim(),
      email,
      phone,
      role,

      address,
      city,
      state,
      zip,
      country,
      taxId,

      status: status || "Active",

      totalQuotesCount: 0,
      totalValue: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error: any) {
    console.error("Create customer error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create customer",
    });
  }
};

// ==========================================
// UPDATE CUSTOMER
// ==========================================

export const updateCustomer = async (req: AuthRequest, res: Response) => {
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
      name,
      company,
      email,
      phone,
      role,
      address,
      city,
      state,
      zip,
      country,
      taxId,
      status,
    } = req.body;

    if (!name?.trim() || !company?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Contact name and company name are required",
      });
    }

    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.id,

        // Important security check
        ownerId,
      },
      {
        name: name.trim(),
        company: company.trim(),
        email,
        phone,
        role,
        address,
        city,
        state,
        zip,
        country,
        taxId,
        status,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error: any) {
    console.error("Update customer error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update customer",
    });
  }
};

// ==========================================
// DELETE CUSTOMER
// ==========================================

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
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

    // Staff can delete only customers created by themselves.
    // Owner can delete any customer in their workspace.
    if (req.user.role === "staff") {
      deleteFilter.userId = req.user.userId;
    }

    const customer = await Customer.findOneAndDelete(deleteFilter);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found or you do not have permission to delete it",
      });
    }

    return res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error: any) {
    
    console.error("Delete customer error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete customer",
    });
  }
};
