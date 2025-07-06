import { Queue } from "bullmq";
import { connection } from "./queues/redis";

export const notificationQueue = new Queue("NOTIFICATION", { connection });

export const cancelQueue = new Queue("CANCEL_TICKET", { connection });
