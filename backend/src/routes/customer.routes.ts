import { Router } from "express";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getCustomers);

router.get("/:id", authenticate, getCustomerById);

router.post("/", authenticate, createCustomer);

router.put("/:id", authenticate, updateCustomer);

router.delete("/:id", authenticate, deleteCustomer);

export default router;