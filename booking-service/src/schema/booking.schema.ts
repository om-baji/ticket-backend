import { z } from "zod";

const travelClass = z.enum(["SL", "THIRDA", "SECONDA", "FIRSTA"]);
const quota = z.enum(["TATKAL", "GENERAL", "PREMIUM"]);
const berthEnum = z.enum(["SL","NONE","LB","UB","MB","SU"])

const passengerSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  age: z.number().int().min(0, "Age must be non-negative").max(120, "Age unrealistic"),
  berth : berthEnum
});

export const bookingSchema = z.object({
  trainId: z.string().min(1, "Train ID required"),
  travelClass: travelClass,
  quota: quota,
  passengers: z.array(passengerSchema),
  date : z.string()
});
