import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const requireOwner = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "owner") {
    return res.status(403).json({
      success: false,
      message: "Only account owners can manage staff users.",
    });
  }

  next();
};