import express, { type Request, type Response } from "express";
import morgan from "morgan";
import { register } from "prom-client";
import { metricsMiddleware } from "./middlewares/metrics.middleware";
import { prisma } from "./utils/db.singleton";
import { errorHandler } from "./utils/error.handler";
import trainRouter from "./routes/train.routes";
import bookingRouter from "./routes/booking.routes";
import { aP } from "vitest/dist/chunks/reporters.d.BFLkQcL6.js";
import userRouter from "./routes/user.routes";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(metricsMiddleware);

app.get("/metrics", async (_req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("BOOKING SERVICE");
});

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;

  res.status(200).json({
    status: "ok",
    db: "up",
    message: "Booking Service is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/trains", trainRouter);
app.use("/api/v1/booking", bookingRouter);

app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log("Server running on PORT", process.env.PORT)
);
