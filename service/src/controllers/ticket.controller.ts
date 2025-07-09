import type { Request, Response } from "express";
import { generatePNR, RedisKeys } from "../lib/key.gen";
import { bookingClient } from "../protos/config";
import { bookingSchema } from "../schema/booking.schema";
import prisma from "../utils/db.singleton";
import redis from "../utils/redis.singleton";
import { AppError } from "../utils/global.error";
import { coachMap } from "../utils/utils";
import { populateTicket } from "../lib/queue";
import type { BookingResponse } from "../utils/types";
import { PassengerStatus, BerthPreference } from "@shared/index";

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
    if (!isValid.success) {
      throw new AppError("Validation Error \n" + isValid.error, 411);
    }

    const { trainId, travelClass, quota, date } = isValid.data;
    const userId = req.user?.id;
    if (!userId) throw new AppError("User ID is missing", 400);

    const id = await this.getTrainId(trainId);
    const pnr = generatePNR(userId, trainId);

    const grp = await prisma.trainSeatConfig.groupBy({
      by: ["berth", "trainId"],
      _sum: {
        seatCount: true,
      },
    });

    const seatConfig = grp
      .filter((group) => group.trainId === id)
      .map((grp) => ({
        seatCount: grp._sum.seatCount,
        berth: grp.berth.toString(),
      }));

    const grpcBody = { ...req.body, seatConfig, pnr };

    const response = await new Promise<BookingResponse>((resolve, reject) => {
      bookingClient.BookTicket(grpcBody, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    res.status(200).json(response);

    try {
      (async () => {
        try {
          const booking = await prisma.trainBooking.create({
            data: {
              userId,
              trainId: id,
              class: travelClass,
              quota,
              price: 500,
              date: new Date(date),
              pnr,
              status: "CONFIRMED",
            },
          });

          await Promise.all(
            response.seat.map((seat) =>
              prisma.passengerBooking.create({
                data: {
                  bookingId: booking.id,
                  name: seat.info.name,
                  age: seat.info.age,
                  status: seat.status as PassengerStatus,
                  seatNo: seat.seatNo,
                  berthPreference: seat.berth as BerthPreference,
                },
              })
            )
          );
        } catch (error) {
          console.log("Ticket-gen failed, retry initiated!");
          console.error(error);
          await populateTicket.add("ticket-gen", {
            ...response,
            userId,
            trainId: id,
            class: travelClass,
            quota,
            price: 500,
            date,
          });
        }
      })();
    } catch (error) {
      console.error("gRPC booking failed:", error);
      res.status(500).json({ error: "Booking failed" });
    }
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
        if (!seat.seatNo) {
          throw new AppError(`Seat number is null or undefined: ${seat.seatNo}`, 400);
        }
        const seatNumber = parseInt(seat.seatNo.match(/\d+/)?.[0] || "-1", 10);
        if (seatNumber < 0) {
          throw new AppError(`Invalid seat number: ${seat.seatNo}`, 400);
        }

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
          redis.zadd(zkey, seatNumber - 1, `${mappedClass}-${seatNumber}`),
          redis.setbit(bitkey, seatNumber - 1, 0),
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
