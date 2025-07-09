import { Queue } from "bullmq";

export const populateTicket = new Queue("TICKET_GEN", {
  connection: {
    url: process.env.REDIS_URI,
  },
});

export const notificationQueue = new Queue("NOTIFICATION", {
  connection: {
    url: process.env.REDIS_URI,
  },
});
