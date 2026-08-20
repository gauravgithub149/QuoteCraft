import { Response } from "express";
import { Product } from "../models/Product";
import { AuthRequest } from "../middleware/auth.middleware";

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

// GET ALL PRODUCTS
export const getProducts = async (req: AuthRequest, res: Response) => {
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

    const products = await Product.find({
      ownerId,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

// GET PRODUCT BY ID
export const getProductById = async (req: AuthRequest, res: Response) => {
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

    const product = await Product.findOne({
      _id: req.params.id,
      ownerId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
};

// CREATE PRODUCT
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const {
      type,
      name,
      sku,
      category,
      description,
      unitPrice,
      costPrice,
      taxStatus,
      stockLevel,
      billingUnit,
      status,
    } = req.body;

    if (!name || !sku) {
      return res.status(400).json({
        success: false,
        message: "Product name and SKU are required",
      });
    }

    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(403).json({
        success: false,
        message: "Workspace owner not found.",
      });
    }

    const product = await Product.create({
      userId: req.user.userId,
      ownerId,

      type,
      name,
      sku,
      category,
      description,
      unitPrice,
      costPrice,
      taxStatus,
      stockLevel,
      billingUnit,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req: AuthRequest, res: Response) => {
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

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        ownerId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req: AuthRequest, res: Response) => {
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

    // Staff can delete only products created by themselves.
    if (req.user.role === "staff") {
      deleteFilter.userId = req.user.userId;
    }

    const product = await Product.findOneAndDelete(deleteFilter);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you don't have permission to delete it",
      });
    }

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};
