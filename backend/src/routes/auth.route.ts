import { Router } from "express";

import authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public Routes

router.post("/register", authController.register);

router.post("/login", authController.login);

// Protected Route

router.get("/me", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);

export default router;
