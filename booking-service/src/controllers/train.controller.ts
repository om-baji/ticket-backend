import type { Request, Response } from "express";
import { prisma } from "../utils/db.singleton";
import { AppError } from "../utils/global.error";
import { redis } from "../utils/redis.singleton";

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

    const train = await prisma.train.findUnique({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      train,
    });
  };

  public getTrainsBySourceAndDest = async (req: Request, res: Response) => {
    const { src, dest } = req.query;

    if (!src || !dest) throw new AppError("INVALID QUERY PARAMS", 411);

    const trains = await prisma.train.findMany({
      where: {
        source: src as string,
        destination: dest as string,
      },
    });

    res.status(200).json({
      success: true,
      trains,
    });
  };

  public getTrainsBySource = async (req: Request, res: Response) => {
    const { src } = req.query;

    if (!src) throw new AppError("No Source station provided", 411);

    const trains = await prisma.train.findMany({
      where: {
        source: src as string,
      },
    });

    res.status(200).json({
      success: true,
      trains,
    });
  };

  public getTrainsByDest = async (req: Request, res: Response) => {
    const { dest } = req.query;

    if (!dest) throw new AppError("No dest station provided", 411);

    const trains = await prisma.train.findMany({
      where: {
        destination: dest as string,
      },
    });

    res.status(200).json({
      success: true,
      trains,
    });
  };

  public getSeatsAval = async (req: Request, res: Response) => {
    const { trainId } = req.params;

    if (!trainId) throw new AppError("No dest station provided", 411);

    const groupedSeats = await prisma.trainSeatConfig.groupBy({
      by: ["class"],
      where: {
        trainId,
      },
      _count: true,
    });

    res.status(200).json({
      success: true,
      groupedSeats,
    });
  };
}

export const TrainController = Train.getInstance();