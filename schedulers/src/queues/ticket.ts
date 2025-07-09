import { Queue } from "bullmq";
import { connection } from "../lib/redis";

export const populateTicket = new Queue("TICKET_GEN", {
  connection: connection
});