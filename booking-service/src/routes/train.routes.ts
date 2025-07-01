import express from "express"
import { TrainController } from "../controllers/train.controller";
import { asyncHandler } from "../utils/async.handler";

const trainRouter = express.Router();

trainRouter.get("/bulk", asyncHandler(TrainController.getTrainBulk))

trainRouter.get("/info/:id", asyncHandler(TrainController.getTrain))

trainRouter.get("/search", asyncHandler(TrainController.getTrainsBySourceAndDest))

trainRouter.get("/source", asyncHandler(TrainController.getTrainsBySource))

trainRouter.get("/destination", asyncHandler(TrainController.getTrainsByDest))

trainRouter.get("/seats/:trainId", asyncHandler(TrainController.getSeatsAval))

export default trainRouter;