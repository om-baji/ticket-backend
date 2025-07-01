import { type Request, type Response, type NextFunction } from "express";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational ?? statusCode < 500;

  const response = {
    success: false,
    message: err.message || "Something went wrong",
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
    }),
  };

  if (!isOperational) {
    console.error("Unexpected Error:", err);
  }

  res.status(statusCode).json(response);
}
