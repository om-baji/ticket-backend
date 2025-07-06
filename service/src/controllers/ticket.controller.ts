import type { Request, Response } from "express";
import { generatePNR, RedisKeys } from "../lib/key.gen";
import { bookingClient } from "../protos/config";
import { bookingSchema } from "../schema/booking.schema";
import { prisma } from "../utils/db.singleton";
import { AppError } from "../utils/global.error";
import { redis } from "../utils/redis.singleton";
import { coachMap } from "../utils/utils";

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

    const { trainId } = isValid.data;

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

    if (!req.user?.id) {
      throw new AppError("User ID is missing", 400);
    }
    const pnr = generatePNR(req.user.id, trainId);

    const grpcBody = {
      ...req.body,
      seatConfig,
      pnr,
    };

    bookingClient.BookTicket(grpcBody, (err: any, response: any) => {
      if (err) {
        console.error("gRPC Error:", err);
        res.status(500).json({ error: err.message });
      }
      res.json(response);
    });
  };

  public cancelTicket = async (req: Request, res: Response) => {
    const { pnr } = req.body;

    if (!pnr) throw new AppError("PNR Not Provided!", 411);

    const ticket = await prisma.trainBooking.findUnique({
      where: {
        pnr,
      },
      include: {
        Train: true,
        passengers: true,
      },
    });

    if (!ticket) throw new AppError("Ticket not found!", 404);

    const seats = ticket.passengers.map((pass) => {
      return {
        seatNo: pass.seatNo,
        berth: pass.berthPreference,
      };
    });

    const mappedClass = coachMap.get(ticket.class);
    if (!mappedClass) throw new AppError("Invalid class", 400);

    await Promise.all(
      seats.map((seat) => {
        const bitkey = RedisKeys.generateKey(
          "redis",
          "BITMAP",
          ticket.Train.trainNumber,
          mappedClass,
          seat.berth
        );

        const zkey = RedisKeys.generateKey(
          "redis",
          "ZSET",
          ticket.Train.trainNumber,
          mappedClass,
          seat.berth
        );

        return Promise.all([
          redis.zadd(zkey, Number(seat.seatNo) - 1, `${mappedClass}-${seat.seatNo}`),
          redis.setbit(bitkey, Number(seat.seatNo) - 1, 0),
        ]);
      })
    );

    res.status(200).json({
      success: true,
      message: "Ticket cancelled!",
    });
  };
}

export const TicketController = Ticket.getInstance();
