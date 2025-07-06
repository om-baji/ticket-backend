import cron from "node-cron";
import { pg, coachMap, TTL, redis } from "./utils";

const populateRedis = async () => {
  const res = await pg`SELECT * FROM "TrainSeatConfig"`;

  if (!res) return;

  await Promise.all(
    res.map(async (config) => {
      const zsetKey = `redis:ZSET:${config.trainId}:${config.class}:${config.berth}`;
      const bitmapKey = `redis:BITMAP:${config.trainId}:${coachMap.get(config.class)}:${config.berth}`;

      const seats = Array.from({ length: config.seatCount }, (_, i) => i + 1);

      await redis.del(zsetKey);
      await redis.zadd(
        zsetKey,
        ...seats.flatMap((i) => [i, `${coachMap.get(config.class)}-${i}`])
      );
      await redis.expire(zsetKey, TTL);

      await Promise.all(seats.map((i) => redis.setbit(bitmapKey, i, 0)));
      await redis.expire(bitmapKey, TTL);
    })
  );
};

cron.schedule("0 0 * * *", populateRedis);
