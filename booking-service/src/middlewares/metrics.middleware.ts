import { type NextFunction, type Request, type Response } from 'express';
import { Counter, Histogram, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics();

const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'] as const,
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5] 
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationInSeconds = seconds + nanoseconds / 1e9;

    const route = req.route?.path || req.path;
    const method = req.method;
    const status = res.statusCode.toString();

    httpRequestCounter.inc({ method, route, status });
    httpRequestDuration.observe({ method, route, status }, durationInSeconds);
  });

  next();
};
