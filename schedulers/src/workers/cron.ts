import { Worker } from "bullmq";
import { populateRedis } from "../lib/populate";
import { connection } from "../lib/redis";

new Worker("CRON", populateRedis, { connection });