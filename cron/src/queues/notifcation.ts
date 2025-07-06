import type { Job } from "bullmq";
import { generateEmailTemplate, transport } from "./email";

export const sendNotification = async (job: Job) => {
  console.log("Processing :", job.name);

  await transport.sendMail({
    subject: "Ticket Status",
    to: job.data.email,
    html: generateEmailTemplate(job.data.pnr, job.data),
  });
};
