import { Worker } from "bullmq";
import { connection } from "./redis";
import { sendNotification } from "./notifcation";

new Worker("NOTIFICATION", sendNotification, { connection: connection });
