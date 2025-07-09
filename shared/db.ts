import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

class Singleton {
  private static instance: PrismaClient | null;
  private static redisIntance: Redis | null;

  static getPrismaInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        log: ["query"],
      });
    }

    return this.instance;
  }

  static getRedisInstance(): Redis {
    if (!this.redisIntance) {
      if (!process.env.REDIS_URI) {
        throw new Error("REDIS_URI is not defined in environment");
      }
      this.redisIntance = new Redis();
    }

    return this.redisIntance;
  }
}

export const prisma = Singleton.getPrismaInstance();
export const redis = Singleton.getRedisInstance();

