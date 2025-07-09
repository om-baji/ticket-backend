import type { Request, Response } from "express";
import prisma from "../utils/db.singleton"
import redis from "../utils/redis.singleton"
import { AppError } from "../utils/global.error";
import { RedisKeys } from "../lib/key.gen";

class Train {
  private static instance: Train | null;

  static getInstance() {
    if (!this.instance) this.instance = new Train();
    return this.instance;
  }

  public getTrainBulk = async (_req: Request, res: Response) => {
    const cacheKey = "train_bulk";

    const cache = await redis.get(cacheKey);

    if (cache) {
      res.status(200).json({
        success: true,
        trains: JSON.parse(cache),
      });
      return;
    }

    const trains = await prisma.train.findMany();

    await redis.set(cacheKey, JSON.stringify(trains), "EX", 3600);

    res.status(200).json({
      success: true,
      trains,
    });
  };

  public getTrain = async (req: Request, res: Response) => {
    const id = req.params.id;
    
    const key = RedisKeys.generateKey("train", id);

    const cache = await redis.get(key);

    if (cache) {
      res.status(200).json({
        success: true,
        train: JSON.parse(cache),
      });
    }

    const train = await prisma.train.findUnique({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      train,
    });
    
    await redis.set(key,JSON.stringify(cache), "EX", 5 * 60)
  };

  public getTrainsBySourceAndDest = async (req: Request, res: Response) => {
    const { src, dest } = req.query;

    if (!src || !dest) throw new AppError("INVALID QUERY PARAMS", 411);

    const key = RedisKeys.generateKey(
      "search",
      src as string,
      dest as string,
      "seats",
      "aval"
    );

    const cache = await redis.get(key);

    if (cache) {
      res.status(200).json({
        success: true,
        trains: JSON.parse(cache),
      });
    }

    const trains = await prisma.train.findMany({
      where: {
        source: {
          contains: src as string,
          mode: "insensitive",
        },
        destination: {
          contains: dest as string,
          mode: "insensitive",
        },
      },
    });

    res.status(200).json({
      success: true,
      trains,
    });

    await redis.set(key, JSON.stringify(trains), "EX", 2 * 60);
  };

  public getTrainsBySource = async (req: Request, res: Response) => {
    const { src } = req.query;

    if (!src) throw new AppError("No Source station provided", 411);

    const key = RedisKeys.generateKey("src-search", src as string);

    const cache = await redis.get(key);

    if (cache) {
      res.status(200).json({
        success: true,
        trains: JSON.parse(cache),
      });
      return;
    }

    const trains = await prisma.train.findMany({
      where: {
        source: src as string,
      },
    });

    res.status(200).json({
      success: true,
      trains,
    });

    await redis.set(key, JSON.stringify(trains), "EX", 5 * 60);
  };

  public getTrainsByDest = async (req: Request, res: Response) => {
    const { dest } = req.query;

    if (!dest) throw new AppError("No dest station provided", 411);

    const key = RedisKeys.generateKey("dest-search", dest as string);

    const cache = await redis.get(key);

    if (cache) {
      res.status(200).json({
        success: true,
        trains: JSON.parse(cache),
      });
      return;
    }

    const trains = await prisma.train.findMany({
      where: {
        destination: dest as string,
      },
    });

    res.status(200).json({
      success: true,
      trains,
    });

    await redis.set(key, JSON.stringify(trains), "EX", 5 * 60);
  };

  public getSeatsAval = async (req: Request, res: Response) => {
    const { trainId } = req.params;

    if (!trainId) throw new AppError("No dest station provided", 411);

    const key = RedisKeys.generateKey(trainId, "seats", "aval");

    const cache = await redis.get(key);

    if (cache) {
      res.status(200).json({
        success: true,
        groupedSeats: JSON.parse(cache),
      });
    }

    const groupedSeats = await prisma.trainSeatConfig.findMany({
      where: {
        trainId,
      },
      select: {
        class: true,
        berth: true,
        quota: true,
        seatCount: true,
      },
    });

    res.status(200).json({
      success: true,
      groupedSeats,
    });

    await redis.set(key, JSON.stringify(groupedSeats), "EX", 2 * 60);
  };
}

export const TrainController = Train.getInstance();
