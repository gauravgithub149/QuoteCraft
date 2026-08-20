import { Router } from "express";

import {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  updateQuotationStatus,
  deleteQuotation,
} from "../controllers/quotation.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getQuotations);

router.get("/:id", authenticate, getQuotationById);

router.post("/", authenticate, createQuotation);

router.put("/:id", authenticate, updateQuotation);

router.patch(
  "/:id/status",
  authenticate,
  updateQuotationStatus
);

router.delete("/:id", authenticate, deleteQuotation);

export default router;