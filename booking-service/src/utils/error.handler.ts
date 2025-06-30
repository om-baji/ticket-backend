import { type Request, type Response, type NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("API Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}
