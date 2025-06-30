import { RedisClient } from "bun";

class Cache {
  private static instance: RedisClient;
  private static readonly TTL: number = 3600;

  private constructor() {}

  static getInstance(): RedisClient {
    if (!this.instance) {
      if (!process.env.REDIS_URI) {
        throw new Error("REDIS_URI is not defined in environment");
      }
      this.instance = new RedisClient(process.env.REDIS_URI);
    }
    return this.instance;
  }

  static getTTL(): number {
    return this.TTL;
  }
}

export const redis = Cache.getInstance();
