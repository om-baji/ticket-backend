import { neon } from "@neondatabase/serverless";
import RedisClient from "ioredis";

export const redis = new RedisClient(process.env.REDIS_URI!);
export const pg = neon(process.env.DATABASE_URL!);

export const coachMap = new Map([
  ["SL", "SL"],
  ["FIRSTA", "1A"],
  ["SECONDA", "2A"],
  ["THIRDA", "3A"],
]);

export const TTL = 2 * 60 * 60;