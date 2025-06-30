import express, { type Request, type Response } from "express";
import morgan from "morgan";
import { register } from "prom-client";
import { metricsMiddleware } from "./middlewares/metrics.middleware";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(metricsMiddleware)

app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("BOOKING SERVICE");
});

app.listen(process.env.PORT, () =>
  console.log("Server running on PORT", process.env.PORT)
);
