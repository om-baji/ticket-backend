import { Queue } from "bullmq";
import { connection } from "../lib/redis";

export const cancelQueue = new Queue("CANCEL_TICKET", { connection });
