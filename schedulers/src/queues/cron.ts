import { Queue } from "bullmq";
import { connection } from "../lib/redis";

export const cronQueue = new Queue("CRON", { connection });
