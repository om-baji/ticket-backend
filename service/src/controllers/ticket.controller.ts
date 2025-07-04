import type { Request, Response } from "express";
import { bookingClient } from "../protos/config";

class Ticket {
  private static instance: Ticket | null;

  constructor() {}

  static getInstance() {
    if (!this.instance) this.instance = new Ticket();
    return this.instance;
  }

  public bookTicket = async (req: Request, res: Response) => {
    bookingClient.BookTicket(req.body, (err: any, response: any) => {
      if (err) {
        console.error("gRPC Error:", err);
        res.status(500).json({ error: err.message });
      }
      res.json(response);
    });
  };
}

export const TicketController = Ticket.getInstance();
