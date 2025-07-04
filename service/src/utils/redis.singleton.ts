import { Redis } from "ioredis";
import { randomUUID } from "crypto";

class Cache {
  private static instance: Redis;
  private static readonly TTL: number = 3600;

  private constructor() {}

  static getInstance(): Redis {
    if (!this.instance) {
      if (!process.env.REDIS_URI) {
        throw new Error("REDIS_URI is not defined in environment");
      }
      this.instance = new Redis();
    }
    return this.instance;
  }

  static getTTL(): number {
    return this.TTL;
  }
}

export const redis = Cache.getInstance();
export const redisLock = async function acquireLock(
    key: string,
    ttl: number = 10
  ): Promise<string | null> {
    const lockValue = `${key}:${randomUUID()}`;

    const res = await redis.setnx(key, lockValue);

    return res === 1 ? lockValue : null;
  }

export const releaseLock = async function releaseLock(key: string, lockValue: string): Promise<boolean> {
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1]
      then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await redis.eval(luaScript, 1, key, lockValue);

    return result === 1;
  }
