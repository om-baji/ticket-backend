export type Seat = {
  seatNo: string;
};

export interface JwtPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}
