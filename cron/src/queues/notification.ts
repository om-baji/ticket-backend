import { Queue } from "bullmq";
import { connection } from "../lib/redis";

export const notificationQueue = new Queue("NOTIFICATION", { connection });