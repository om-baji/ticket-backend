import request from "supertest";
import express from "express";
import trainRouter from "../src/routes/train.routes";
import { describe, beforeEach, vi, it, expect } from "vitest";
import redis from "../src/utils/redis.singleton";
import prisma from "../src/utils/db.singleton";
import { errorHandler } from "../src/utils/error.handler";

vi.mock("../src/utils/db.singleton", () => ({
  prisma: {
    train: {
      findMany: vi
        .fn()
        .mockResolvedValue([
          { id: "t1", name: "Mock Train", source: "SRC", destination: "DEST" },
        ]),
      findUnique: vi.fn().mockResolvedValue({
        id: "t1",
        name: "Rajdhani",
        source: "SRC",
        destination: "DEST",
      }),
    },
    trainSeatConfig: {
      findMany: vi.fn().mockResolvedValue([{ class: "SL", _count: 42 }]),
    },
    trainFare: {
      findMany: vi.fn(), 
    },
    seatInventory: {
      groupBy: vi.fn().mockResolvedValue([{ class: "SL", _count: 42 }]),
    },
    trainBooking: {
      findMany: vi.fn(), 
    },
  },
}));

vi.mock("../src/utils/redis.singleton", () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
  },
}));

const app = express();
app.use(express.json());
app.use("/train", trainRouter);
app.use(errorHandler);

describe("TrainController Routes (Updated Model Names)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /train/bulk - from Redis cache", async () => {
    (redis.get as any).mockResolvedValueOnce(
      JSON.stringify([{ id: "cached-train" }])
    );

    const res = await request(app).get("/train/bulk");

    expect(res.status).toBe(200);
    expect(res.body.trains).toEqual([{ id: "cached-train" }]);
  });

  it("GET /train/bulk - from DB fallback", async () => {
    (redis.get as any).mockResolvedValueOnce(null);
    (prisma.train.findMany as any).mockResolvedValueOnce([{ id: "db-train" }]);
    (redis.set as any).mockResolvedValueOnce("OK");

    const res = await request(app).get("/train/bulk");

    expect(res.status).toBe(200);
    expect(prisma.train.findMany).toHaveBeenCalled();
    expect(res.body.trains).toEqual([{ id: "db-train" }]);
  });

  it("GET /train/info/:id", async () => {
    (prisma.train.findUnique as any).mockResolvedValueOnce({
      id: "t1",
      name: "Rajdhani",
    });

    const res = await request(app).get("/train/info/t1");

    expect(res.status).toBe(200);
    expect(res.body.train.name).toBe("Rajdhani");
  });

  it("GET /train/search?src=X&dest=Y", async () => {
    (prisma.train.findMany as any).mockResolvedValueOnce([
      { id: "t2", source: "X", destination: "Y" },
    ]);

    const res = await request(app).get("/train/search?src=X&dest=Y");

    expect(res.status).toBe(200);
    expect(res.body.trains.length).toBe(1);
  });

  it("GET /train/source?src=X", async () => {
    (prisma.train.findMany as any).mockResolvedValueOnce([
      { id: "t3", source: "X" },
    ]);

    const res = await request(app).get("/train/source?src=X");

    expect(res.status).toBe(200);
    expect(res.body.trains[0].source).toBe("X");
  });

  it("GET /train/destination?dest=Z", async () => {
    (prisma.train.findMany as any).mockResolvedValueOnce([
      { id: "t4", destination: "Z" },
    ]);

    const res = await request(app).get("/train/destination?dest=Z");

    expect(res.status).toBe(200);
    expect(res.body.trains[0].destination).toBe("Z");
  });

//   it("GET /train/seats/:trainId", async () => {
//     (prisma.trainSeatConfig.groupBy as any).mockResolvedValueOnce([
//       { class: "SL", _count: 42 },
//     ]);

//     const res = await request(app).get("/train/seats/t5");

//     expect(res.status).toBe(200);
//     expect(res.body.groupedSeats[0]._count).toBe(42);
//   });

  it("GET /train/search - missing query params", async () => {
    const res = await request(app).get("/train/search?src=OnlySrc");

    expect(res.status).toBe(411);
    expect(res.body.message).toBe("INVALID QUERY PARAMS");
  });
});
