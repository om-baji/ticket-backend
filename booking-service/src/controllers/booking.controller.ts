// import {
//   BerthPreference,
//   type ClassType,
//   type SeatInventory,
// } from "@prisma/client";
// import { type Request, type Response } from "express";
// import { bookingSchema } from "../schema/booking.schema";
// import { RedisKeys } from "../utils/cache.key";
// import { prisma } from "../utils/db.singleton";
// import { AppError } from "../utils/global.error";
// import { redis, redisLock, releaseLock } from "../utils/redis.singleton";
// import type { Seat } from "../utils/types";

// type PassengerInput = {
//   name: string;
//   age: number;
//   berth: BerthPreference;
// };

// class Booking {
//   private static instance: Booking | null;

//   static getInstance(): Booking {
//     if (!this.instance) {
//       this.instance = new Booking();
//     }
//     return this.instance;
//   }

//   private static async seatCheck(
//     quota: string,
//     travelClass: string,
//     trainId: string,
//     passengers: PassengerInput[],
//     date: Date
//   ): Promise<SeatInventory[] | null> {

//     const key = RedisKeys.quotaCount(trainId, date, travelClass, quota);
//     const cache = await redis.get(key);
//     if (cache) return JSON.parse(cache) as SeatInventory[];
    
//     const seats = await prisma.seatInventory.findMany({
//       where: {
//         trainId,
//         class: 'SL',
//         // date,
//         isBooked: false,
//       },
//       orderBy: {
//         berth: "asc",
//       },
//     });

//     if (!seats || seats.length < passengers.length) return null;

//     const remainingSeats = [...seats];
//     const passengerSeats: SeatInventory[] = [];

//     passengers.forEach((passenger) => {
//       const index = remainingSeats.findIndex(
//         (seat) =>
//           seat.berth === passenger.berth && seat.quotaType.includes(quota)
//       );

//       let assigned: SeatInventory | undefined;

//       if (index !== -1) {
//         assigned = remainingSeats.splice(index, 1)[0];
//       } else {
//         assigned = remainingSeats.find((seat) =>
//           seat.quotaType.includes(quota)
//         );
//         if (assigned) {
//           const i = remainingSeats.indexOf(assigned);
//           remainingSeats.splice(i, 1);
//         }
//       }

//       if (assigned) {
//         passengerSeats.push(assigned);
//       }
//     });

//     if (passengerSeats.length < passengers.length) return null;

//     await redis.set(key, JSON.stringify(seats), "EX", 60);

//     return passengerSeats;
//   }

//   public postTicket = async (req: Request, res: Response) => {
//     const body = await req.body;
//     const valid = bookingSchema.safeParse(body);

//     if (!valid.success) throw new AppError("INVALID BODY", 400);

//     const userId = req.user?.id || "some-cuid";
//     if (!userId) throw new AppError("UNAUTHORIZED", 403);

//     const { trainId, travelClass, quota, passengers, date } = valid.data;
//     const bookingDate = new Date(date);

//     const seats = await Booking.seatCheck(
//       quota,
//       travelClass as ClassType,
//       trainId,
//       passengers,
//       bookingDate
//     );

//     if (!seats) throw new AppError("SEAT NOT AVAILABLE", 409);
    
//     console.log("taking locks")
    
//     const locks = await Promise.all(
//       seats.map(async (seat) => {
//         const lock = await redisLock(
//           RedisKeys.seatLock(trainId, new Date(date), seat.seatNo)
//         );
//         console.log('lock -> ', lock)
//         if (!lock) throw new AppError("SEAT LOCK FAILED", 409);
//         return { seat, lock };
//       })
//     );

//     const seatMap = new Map<number, SeatInventory>();
//     passengers.forEach((_, idx) => {
//       seatMap.set(idx, seats[idx]);
//     });

//     const pnr = `PNR${Date.now().toString().slice(-6)}${Math.floor(
//       Math.random() * 1000
//     )}`;

//     try {
//       await prisma.$transaction(async (txn) => {
//         console.log("inside txn")
//         const fare = await txn.fare.findFirst({
//           where: {
//             trainId,
//             class: travelClass as ClassType,
//             quota,
//             effectiveFrom: { lte: bookingDate },
//           },
//           orderBy: {
//             effectiveFrom: "desc",
//           },
//         });

//         if (!fare) throw new AppError("FARE NOT FOUND", 500);

//         const totalFare =
//           BigInt(
//             Math.ceil(Number(fare.baseFare) * Number(fare.dynamicFactor))
//           ) * BigInt(passengers.length);

//         const booking = await txn.booking.create({
//           data: {
//             pnr,
//             userId,
//             trainId,
//             date: bookingDate,
//             class: travelClass,
//             quota,
//             status: "CONFIRMED",
//             price: totalFare,
//           },
//         });

//         await Promise.all(
//           passengers.map(async (passenger, idx) => {
//             const seat = seatMap.get(idx);
//             await txn.passenger.create({
//               data: {
//                 name: passenger.name,
//                 age: passenger.age,
//                 berthPreference: passenger.berth,
//                 seatNo: seat?.seatNo ?? null,
//                 status: "CONFIRMED",
//                 bookingId: booking.id,
//               },
//             });

//             if (seat) {
//               await txn.seatInventory.update({
//                 where: { id: seat.id },
//                 data: {
//                   isBooked: true,
//                   pnr,
//                 },
//               });
//             }
//           })
//         );
//       });

//       await redis.del(
//         RedisKeys.quotaCount(trainId, bookingDate, travelClass, quota)
//       );

//       res.status(201).json({
//         success: true,
//         message: "Booking confirmed",
//         data: {
//           pnr,
//           seats: seats.map((s) => s.seatNo),
//         },
//       });
//     } catch (error: any) {
//       throw new AppError(error.message ?? "BOOKING FAILED", 500);
//     } finally {
//       await Promise.allSettled(
//         locks.map(async ({ seat, lock }) => {
//           try {
//             await releaseLock(
//               RedisKeys.seatLock(trainId, new Date(date), seat.seatNo),
//               lock
//             );
//           } catch (e) {
//             console.warn("Failed to release lock:", e);
//           }
//         })
//       );
//     }
//   };
// }

// export const BookingController = Booking.getInstance();