import type { Request, Response } from "express";
import { RedisKeys } from "../lib/key.gen";
import { bookingClient } from "../protos/config";
import {
  bookingSchema
} from "../schema/booking.schema";
import { prisma } from "../utils/db.singleton";
import { AppError } from "../utils/global.error";
import { redis } from "../utils/redis.singleton";

class Ticket {
  private static instance: Ticket | null;

  constructor() {}

  static getInstance() {
    if (!this.instance) this.instance = new Ticket();
    return this.instance;
  }

  private async getTrainId(train: string) {
    const key = RedisKeys.generateKey("train", "id", train);

    const cache = await redis.get(key);

    if (cache) return cache;

    const tr = await prisma.train.findFirst({
      where: {
        trainNumber: train,
      },
      select: {
        id: true,
      },
    });
    if (!tr) throw new AppError("Train not found!", 404);
    await redis.set(key, tr.id, "EX", 10 * 60);

    return tr.id;
  }

  public bookTicket = async (req: Request, res: Response) => {
    const isValid = bookingSchema.safeParse(req.body);

    if (!isValid.success)
      throw new AppError("Validation Error \n" + isValid.error, 411);

    const { trainId, quota, travelClass, date, passengers } = isValid.data;

    const id = await this.getTrainId(trainId);

    const grp = await prisma.trainSeatConfig.groupBy({
      by: ["berth", "trainId"],
      _sum: {
        seatCount: true,
      },
    });

    const seatConfig = grp
      .filter((group) => group.trainId === id)
      .map((grp) => {
        return { seatCount: grp._sum.seatCount, berth: grp.berth.toString() };
      });
    
    const grpcBody = {
      ...req.body,
      seatConfig
    }

    bookingClient.BookTicket(grpcBody, (err: any, response: any) => {
      if (err) {
        console.error("gRPC Error:", err);
        res.status(500).json({ error: err.message });
      }
      res.json(response);
    });
  };
}

export const TicketController = Ticket.getInstance();
