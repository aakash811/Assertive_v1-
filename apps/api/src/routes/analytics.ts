import { Hono } from "hono";
import { ok } from "../lib/api-response";
import type { HonoVariables } from "../types/hono";
import { analyticsService } from "../services/analytics.service";

export const analyticsRoutes = new Hono<{ Variables: HonoVariables }>();

analyticsRoutes.get("/summary", async (c) => {
  const result = await analyticsService.getSummary(c.get("projectId"));

  return c.json(ok(result));
});

analyticsRoutes.get("/failures", async (c) => {
  const result = await analyticsService.getMostFailingTests(c.get("projectId"));

  return c.json(ok(result));
});

analyticsRoutes.get("/slowest", async (c) => {
  const result = await analyticsService.getSlowestTests(c.get("projectId"));

  return c.json(ok(result));
});

analyticsRoutes.get("/flaky", async (c) => {
  const result = await analyticsService.getFlakyTests(c.get("projectId"));

  return c.json(ok(result));
});

analyticsRoutes.get("/status-distribution", async (c) => {
  const result = await analyticsService.getStatusDistribution(
    c.get("projectId"),
  );

  return c.json(ok(result));
});
