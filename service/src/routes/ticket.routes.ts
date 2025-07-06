import express from "express";
import { asyncHandler } from "../utils/async.handler";
import { TicketController } from "../controllers/ticket.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const ticketRouter = express.Router();

ticketRouter.use(authMiddleware);

ticketRouter.post("/book", asyncHandler(TicketController.bookTicket));

ticketRouter.post("/cancel", asyncHandler(TicketController.cancelTicket));

export default ticketRouter;
