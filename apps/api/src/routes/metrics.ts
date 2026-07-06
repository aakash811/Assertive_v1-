import { Hono } from "hono";
import { ok } from "../lib/api-response";
import { metricsService } from "../services/metrics.service";
import { HonoVariables } from "../types/hono";

export const metricsRoutes = new Hono<{ Variables: HonoVariables }>();

metricsRoutes.get("/summary", async (c) => {
  const from = c.req.query("from");
  const to = c.req.query("to");
  const projectId = c.get("projectId");

  const window = {
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  };
  const result = await metricsService.getSummary(projectId, window);

  return c.json(ok(result));
});

metricsRoutes.get("/trends", async (c) => {
  const projectId = c.get("projectId");
  const days = Number(c.req.query("days")) || 30;

  const result = await metricsService.getTrend(projectId, days);

  return c.json(ok(result));
});
