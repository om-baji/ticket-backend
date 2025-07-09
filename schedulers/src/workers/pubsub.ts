import { redis } from "@shared/db";
import { waitlistedQueue } from "../queues/waiting";
import { populateTicket } from "../queues/ticket";

await redis.subscribe("SEAT_FREE", async (message: any) => {
  try {
    const { trainId, class: classType, quota } = JSON.parse(message);

    const jobs = await waitlistedQueue.getJobs(["waiting"]);

    const match = jobs.find((job) => {
      const j = job.data;
      return (
        j.trainId === trainId && j.class === classType && j.quota === quota
      );
    });

    if (!match) return;

    await populateTicket.add("promote-ticket", match.data);
    await match.remove();

    console.log("Promoted waitlisted passenger:", match.data.pnr);
  } catch (err) {
    console.error("Error handling SEAT_FREE event:", err);
  }
});
