import { Worker } from "bullmq";
import { connection } from "../lib/redis";
import { sendNotification } from "../lib/notifcation";

new Worker("NOTIFICATION", sendNotification, { connection: connection });
