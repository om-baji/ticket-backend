import express from "express";
import { asyncHandler } from "../utils/async.handler";
import { TicketController } from "../controllers/ticket.controller";

const ticketRouter = express.Router();

ticketRouter.post("/book", asyncHandler(TicketController.bookTicket));

export default ticketRouter;
