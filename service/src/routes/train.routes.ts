import express from "express"
import { TrainController } from "../controllers/train.controller";
import { asyncHandler } from "../utils/async.handler";

const trainRouter = express.Router();

/**
 * @openapi
 * /api/v1/trains/bulk:
 *   get:
 *     summary: Get all trains (cached)
 *     tags: [Trains]
 *     responses:
 *       200:
 *         description: List of all trains
 */
trainRouter.get("/bulk", asyncHandler(TrainController.getTrainBulk));

/**
 * @openapi
 * /api/v1/trains/info/{id}:
 *   get:
 *     summary: Get train info by ID
 *     tags: [Trains]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Train ID
 *     responses:
 *       200:
 *         description: Train info
 *       404:
 *         description: Train not found
 */
trainRouter.get("/info/:id", asyncHandler(TrainController.getTrain));

/**
 * @openapi
 * /api/v1/trains/search:
 *   get:
 *     summary: Search trains by source and destination
 *     tags: [Trains]
 *     parameters:
 *       - in: query
 *         name: src
 *         required: true
 *         schema:
 *           type: string
 *         description: Source station name
 *       - in: query
 *         name: dest
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination station name
 *     responses:
 *       200:
 *         description: List of matching trains
 *       411:
 *         description: Invalid query params
 */
trainRouter.get("/search", asyncHandler(TrainController.getTrainsBySourceAndDest));

/**
 * @openapi
 * /api/v1/trains/source:
 *   get:
 *     summary: Get trains by source station
 *     tags: [Trains]
 *     parameters:
 *       - in: query
 *         name: src
 *         required: true
 *         schema:
 *           type: string
 *         description: Source station name
 *     responses:
 *       200:
 *         description: List of trains from source
 *       411:
 *         description: No source provided
 */
trainRouter.get("/source", asyncHandler(TrainController.getTrainsBySource));

/**
 * @openapi
 * /api/v1/trains/destination:
 *   get:
 *     summary: Get trains by destination station
 *     tags: [Trains]
 *     parameters:
 *       - in: query
 *         name: dest
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination station name
 *     responses:
 *       200:
 *         description: List of trains to destination
 *       411:
 *         description: No destination provided
 */
trainRouter.get("/destination", asyncHandler(TrainController.getTrainsByDest));

/**
 * @openapi
 * /api/v1/trains/seats/{trainId}:
 *   get:
 *     summary: Get available seats for a train
 *     tags: [Trains]
 *     parameters:
 *       - in: path
 *         name: trainId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the train
 *     responses:
 *       200:
 *         description: Seat configuration grouped by class, quota, and berth
 *       411:
 *         description: No trainId provided
 */
trainRouter.get("/seats/:trainId", asyncHandler(TrainController.getSeatsAval));


export default trainRouter;