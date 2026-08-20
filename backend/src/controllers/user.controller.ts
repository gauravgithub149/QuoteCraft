import { Request, Response } from "express";
import userService from "../services/user.service";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../middleware/auth.middleware";
import mongoose from "mongoose";
class UserController {
  // ==========================================
  // GET ALL STAFF
  // ==========================================

  async getStaffUsers(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return sendError(res, "Authentication required.", 401);
      }

      const users = await userService.getStaffUsers(ownerId);

      return sendSuccess(res, "Staff users fetched successfully.", users);
    } catch (error) {
      console.error("Get staff users error:", error);

      return sendError(
        res,
        error instanceof Error ? error.message : "Failed to fetch staff users.",
        500,
      );
    }
  }

  // ==========================================
  // GET SINGLE STAFF
  // ==========================================

  async getStaffUser(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return sendError(res, "Authentication required.", 401);
      }

      const id = String(req.params.id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, "Invalid staff user ID.", 400);
      }

      const user = await userService.getStaffUser(ownerId, id);

      return sendSuccess(res, "Staff user fetched successfully.", user);
    } catch (error) {
      console.error("Get staff user error:", error);

      return sendError(
        res,
        error instanceof Error ? error.message : "Failed to fetch staff user.",
        404,
      );
    }
  }

  // ==========================================
  // CREATE STAFF
  // ==========================================

  async createStaff(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return sendError(res, "Authentication required.", 401);
      }

      const staff = await userService.createStaff(ownerId, req.body);

      return sendSuccess(res, "Staff member created successfully.", staff, 201);
    } catch (error) {
      console.error("Create staff error:", error);

      return sendError(
        res,
        error instanceof Error
          ? error.message
          : "Failed to create staff member.",
        400,
      );
    }
  }

  // ==========================================
  // UPDATE STAFF
  // ==========================================

  async updateStaff(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return sendError(res, "Authentication required.", 401);
      }

      const id = String(req.params.id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, "Invalid staff user ID.", 400);
      }

      const staff = await userService.updateStaff(ownerId, id, req.body);

      return sendSuccess(res, "Staff member updated successfully.", staff);
    } catch (error) {
      console.error("Update staff error:", error);

      return sendError(
        res,
        error instanceof Error
          ? error.message
          : "Failed to update staff member.",
        400,
      );
    }
  }

  // ==========================================
  // UPDATE STAFF STATUS
  // ==========================================

  async updateStaffStatus(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return sendError(res, "Authentication required.", 401);
      }

      const id = String(req.params.id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, "Invalid staff user ID.", 400);
      }
      const { status } = req.body;

      const staff = await userService.updateStaffStatus(ownerId, id, status);

      return sendSuccess(res, "Staff status updated successfully.", staff);
    } catch (error) {
      console.error("Update staff status error:", error);

      return sendError(
        res,
        error instanceof Error
          ? error.message
          : "Failed to update staff status.",
        400,
      );
    }
  }

  // ==========================================
  // DELETE STAFF
  // ==========================================

  async deleteStaff(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return sendError(res, "Authentication required.", 401);
      }

      const id = String(req.params.id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, "Invalid staff user ID.", 400);
      }

      await userService.deleteStaff(ownerId, id);

      return sendSuccess(res, "Staff member deleted successfully.", null);
    } catch (error) {
      console.error("Delete staff error:", error);

      return sendError(
        res,
        error instanceof Error
          ? error.message
          : "Failed to delete staff member.",
        404,
      );
    }
  }
}

export default new UserController();
