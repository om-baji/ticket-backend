import { type NextFunction, type Request, type Response } from "express"

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authMiddleware = async (req : Request,res : Response, next : NextFunction) => {
    
    const header = req.headers.authorization;

    if(!header || !header.startsWith("Bearer ")) throw new Error("No Auth Header");

    const token = header.split(" ")[1];

    //grpc call

    req.user = {
        id : ""
    };
}