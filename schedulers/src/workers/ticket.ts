import {
  BerthPreference,
  BookingStatus,
  PassengerStatus,
  type ClassType,
  type QuotaType,
} from "@shared/index";
import prisma from "@shared/prisma";
import { Job, Worker } from "bullmq";
import { connection } from "../lib/redis";
import type { Seat, TicketData } from "../lib/types";

new Worker(
  "TICKET_GEN",
  async (job: Job) => {
    try {
      console.log("Processing :", job.name);

      const {
        seat,
        date,
        price,
        pnr,
        success,
        userId,
        trainId,
        status,
        class: class_type,
        quota,
      } = job.data as TicketData;

      console.log("Job data:", job.name);

      if (!success) return null;

      await prisma.$transaction(async (txn) => {
        const booking = await txn.trainBooking.create({
          data: {
            userId,
            trainId: trainId,
            pnr,
            price,
            date,
            status: status as BookingStatus,
            class: class_type as ClassType,
            quota: quota as QuotaType,
          },
        });

        await Promise.all(
          seat.map(async (seat: Seat) => {
            await txn.passengerBooking.create({
              data: {
                name: seat.info.name,
                age: seat.info.age,
                berthPreference: seat.berth as BerthPreference,
                seatNo: seat.seatNo,
                status: seat.status as PassengerStatus,
                bookingId: booking.id,
              },
            });
          })
        );
      });

      console.log("Booked");
    } catch (err) {
      console.error("Worker error:", err);
      throw err;
    }
  },
  {
    connection,
  }
);
