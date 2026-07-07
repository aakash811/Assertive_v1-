import { Hono } from "hono";
import { ok } from "../lib/api-response";
import { config } from "../lib/config";

export const healthRoutes = new Hono();

healthRoutes.get("/", (c) => {
  return c.json(
    ok({
      status: "ok",
      uptime: process.uptime(),
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    }),
  );
});
