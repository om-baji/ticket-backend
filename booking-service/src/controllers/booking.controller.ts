import { type Request, type Response } from "express";
import { bookingSchema } from "../schema/booking.schema";
import { prisma } from "../utils/db.singleton";

class Booking {
  private static instance: Booking | null;

  static getInstance(): Booking {
    if (!this.instance) {
      this.instance = new Booking();
    }

    return this.instance;
  }

  static postTicket = async (req: Request, res: Response) => {
    const body = await req.body;

    const valid = bookingSchema.safeParse(body);

    if (!valid.success) throw new Error("INVALID BODY");

    const { trainId, travelClass, quota, passenger } = valid.data;

  };
}

export const BookingController = Booking.getInstance();
