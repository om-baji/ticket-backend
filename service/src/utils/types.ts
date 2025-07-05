export type Seat = {
  seatNo: string;
};

export interface JwtPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface Passenger {
  name: string;
  berth: string;
  age: number;
}

type seatConfig = {
  seatCount : number,
  berth : string
}

export interface BookingRequest {
  trainId: string;
  date: string;
  userId: string;
  class: string;
  quota: string;
  passengers: Passenger[];
  seatConfig : seatConfig[];
}

export interface Seats {
  seatNo : string;
  berth : string,
  status : string,
  info : Passenger
}

export interface BookingResponse {
    pnr : string;
    Seats : Seats[];
    success : boolean;
    message : string;
}