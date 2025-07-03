import { type NextFunction, type Request, type Response } from "express";
import { verifyToken } from "../lib/sign.jwt";
import { AppError } from "../utils/global.error";
import { publicRoutes } from "../constants/routes";
import { isPublicRoute } from "../lib/route.wildcard";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {

  const token = req.cookies.access;

  if (!token) throw new Error("No Auth Header");

  const decode = await verifyToken(token);

  if (!decode) throw new AppError("Unauthorised!", 403);

  req.user = {
    id: decode.userId,
    role: decode.role as string,
  };

  await next();
};
