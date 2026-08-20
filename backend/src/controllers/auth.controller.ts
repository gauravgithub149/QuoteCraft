import { Request, Response } from "express";
import authService from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";

class AuthController {
  // ==========================
  // Register
  // ==========================

  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);

      return sendSuccess(res, "Account created successfully.", result, 201);
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : "Registration failed",
        400,
      );
    }
  }

  // ==========================
  // Login
  // ==========================

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);

      return sendSuccess(res, "Login successful.", result);
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : "Login failed",
        401,
      );
    }
  }

  // ==========================
  // Get Profile
  // ==========================

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const user = await authService.getProfile(userId);

      return sendSuccess(res, "Profile fetched successfully.", user);
    } catch (error) {
      return sendError(
        res,
        error instanceof Error ? error.message : "Unable to fetch profile",
        404,
      );
    }
  }
  // ==========================
  // Update Profile
  // ==========================

  async updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;

    const user = await authService.updateProfile(
      userId,
      req.body
    );

    return sendSuccess(
      res,
      "Profile updated successfully.",
      user
    );
  } catch (error) {
    return sendError(
      res,
      error instanceof Error
        ? error.message
        : "Unable to update profile",
      400
    );
  }
}
}

export default new AuthController();
