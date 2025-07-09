import { cronQueue } from "../queues/cron";

export const scheduleCron = async () => {
  await cronQueue.add(
    "populate-redis",
    {},
    {
      jobId: "populate-redis-daily",
      repeat: {
        every: 24 * 60 * 60 * 1000,
      },
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
};
