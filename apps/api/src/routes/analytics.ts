import { Hono } from "hono";
import { ok } from "../lib/api-response";
import type { HonoVariables } from "../types/hono";
import { analyticsService } from "../services/analytics.service";

export const analyticsRoutes = new Hono<{ Variables: HonoVariables }>();

analyticsRoutes.get("/summary", async (c) => {
  const from = c.req.query("from");
  const to = c.req.query("to");
  const projectId = c.get("projectId");
  const window = {
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  };

  const result = await analyticsService.getSummary(projectId, window);

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

analyticsRoutes.get("/recent-failures", async (c) => {
  const result = await analyticsService.getRecentFailures(c.get("projectId"));

  return c.json(ok(result));
});
