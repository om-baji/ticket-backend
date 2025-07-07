import type { Job } from "bullmq";
import { coachMap, pg, redis, TTL } from "./utils";

export const populateRedis = async (job : Job) => {
  const res =
    await pg`SELECT a.class, a.berth, a.quota, a."seatCount", b."trainNumber"
              FROM "TrainSeatConfig" a
              JOIN "Train" b ON a."trainId" = b.id`;

  if (!res) return;

  await Promise.all(
    res.map(async (config) => {
      const zsetKey = `redis:ZSET:${config.trainNumber}:${coachMap.get(
        config.class
      )}:${config.berth}`;
      const bitmapKey = `redis:BITMAP:${config.trainNumber}:${coachMap.get(
        config.class
      )}:${config.berth}`;

      const seats = Array.from({ length: config.seatCount }, (_, i) => i + 1);

      await redis.del(zsetKey);
      await redis.zadd(
        zsetKey,
        ...seats.flatMap((i) => [i, `${coachMap.get(config.class)}-${i}`])
      );
      await redis.expire(zsetKey, TTL);

      await Promise.all(seats.map((i) => redis.setbit(bitmapKey, i - 1, 0)));
      await redis.expire(bitmapKey, TTL);
    })
  );
};

// populateRedis()
//   .then(() => {
//     console.log("Redis initially populated.");
//   })
//   .catch(console.error);
