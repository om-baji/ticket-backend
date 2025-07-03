export const RedisKeys = {
  seatLock: (trainId: string, date: Date, seatNo: string) =>
    `seat-lock:${trainId}:${date}:${seatNo}`,

  quotaCount: (trainId: string, date: Date, classType: string, quota: string) =>
    `quota:${trainId}:${date}:${classType}:${quota}`,

  fareCache: (trainId: string, classType: string, quota: string) =>
    `fare:${trainId}:${classType}:${quota}`,

  bookingRateLimit: (userId: string) => 
    `rate-limit:user:${userId}`,

  tempHold: (pnr: string) => 
    `hold:booking:${pnr}`,
};
