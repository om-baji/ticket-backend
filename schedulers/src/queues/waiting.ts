import { Queue } from "bullmq";
import { connection } from "../lib/redis";

export const waitlistedQueue = new Queue("WAITLIST", {
  connection,
});