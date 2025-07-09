import express from "express";
import { asyncHandler } from "../utils/async.handler";
import { TicketController } from "../controllers/ticket.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const ticketRouter = express.Router();

ticketRouter.use(authMiddleware);

/**
 * @openapi
 * /api/v1/ticket/book:
 *   post:
 *     summary: Book a train ticket
 *     tags: [Ticket]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trainId
 *               - travelClass
 *               - quota
 *               - date
 *               - seat
 *             properties:
 *               trainId:
 *                 type: string
 *                 example: 12345
 *               travelClass:
 *                 type: string
 *                 example: SLEEPER
 *               quota:
 *                 type: string
 *                 example: GENERAL
 *               date:
 *                 type: string
 *                 format: date
 *               seat:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - info
 *                   properties:
 *                     info:
 *                       type: object
 *                       required:
 *                         - name
 *                         - age
 *                       properties:
 *                         name:
 *                           type: string
 *                         age:
 *                           type: integer
 *                     berth:
 *                       type: string
 *                       example: LOWER
 *     responses:
 *       200:
 *         description: Ticket successfully booked
 *       400:
 *         description: Missing user ID
 *       411:
 *         description: Validation error
 *       500:
 *         description: Booking failed
 */
ticketRouter.post("/book", asyncHandler(TicketController.bookTicket));

/**
 * @openapi
 * /api/v1/ticket/cancel:
 *   post:
 *     summary: Cancel a booked train ticket
 *     tags: [Ticket]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pnr
 *             properties:
 *               pnr:
 *                 type: string
 *                 example: PNR123456
 *     responses:
 *       200:
 *         description: Ticket cancelled successfully
 *       404:
 *         description: Ticket not found
 *       411:
 *         description: PNR not provided
 */
ticketRouter.post("/cancel", asyncHandler(TicketController.cancelTicket));


export default ticketRouter;
