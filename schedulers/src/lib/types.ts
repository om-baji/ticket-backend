export type Seat = {
  seatNo: string;
  berth: string;
  status: string;
  info: {
    name: string;
    berth: string;
    age: number;
  };
};

export type TicketData = {
  seat: Seat[];
  pnr: string;
  userId: string;
  trainId: string;
  success: boolean;
  status: string;
  message: string;
  price: number;
  class: string;
  quota: string;
  date: Date;
};