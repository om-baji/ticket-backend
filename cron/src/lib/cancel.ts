import type { Job } from "bullmq";
import { pg } from "./utils";

export const cancelTicket = async (job : Job) => {
    const pnr = job.data.pnr;

    const query = `SELECT * FROM (?)
                   WHERE pnr = (?)`;

    const ticket = await pg.query(query,["TrainBooking",pnr])

    if(!ticket) return;

    

            
}