import { createMiddleware } from "hono/factory";
import { logger } from "../lib/logger";
import type { HonoVariables } from "../types/hono";

export const requestLogger = createMiddleware<{
  Variables: HonoVariables;
}>(async (c, next) => {
  const start = performance.now();

  await next();

  logger.info("request", {
    requestId: c.get("requestId"),
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs: Math.round(performance.now() - start),
  });
});
