import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { requireOwner } from "../middleware/owner.middleware";
import userController from "../controllers/user.controller";

const router = Router();

router.get("/", authenticate, requireOwner, userController.getStaffUsers);

router.get("/:id", authenticate, requireOwner, userController.getStaffUser);

router.post("/", authenticate, requireOwner, userController.createStaff);

router.put("/:id", authenticate, requireOwner, userController.updateStaff);

router.patch(
  "/:id/status",
  authenticate,
  requireOwner,
  userController.updateStaffStatus,
);

router.delete("/:id", authenticate, requireOwner, userController.deleteStaff);

export default router;
