import type { NextFunction, Request, Response } from "express";
import { RedisKeys } from "../lib/key.gen";
import { redis } from "@shared/db";
import { AppError } from "../utils/global.error";

const WINDOW = 15 * 60;
const LIMIT = 100;

export const ratelimitter = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.ip || "127.0.0.1";

  const blockedKey = RedisKeys.generateKey("redis", "ratelimit", "BLOCKED", ip);

  const limited = await redis.get(blockedKey);
  if (limited) throw new AppError("RATE LIMITED", 429);

  const hashKey = RedisKeys.generateKey("redis", "rate", "COUNT", ip);
  const current = await redis.incr(hashKey);

  if (current === 1) {
    await redis.expire(hashKey, WINDOW);
  }

  if (current > LIMIT) {
    await redis.set(blockedKey, 1, "EX", WINDOW);
    throw new AppError("RATE LIMITED", 429);
  }

  next();
};
