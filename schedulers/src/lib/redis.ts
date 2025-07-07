import type { RedisOptions } from "bullmq";
import IORedis from "ioredis";

export const connection: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: 6379,
};

export const redis = new IORedis(connection);