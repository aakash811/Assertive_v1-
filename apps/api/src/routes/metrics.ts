import { Hono } from "hono";

import type { HonoVariables } from "../types/hono";

import { metricsService } from "../services/metrics.service";

export const metricsRoutes = new Hono<{
  Variables: HonoVariables;
}>();

metricsRoutes.get("/metrics/summary", async (c) => {
  const projectId = c.get("projectId");

  return c.json(await metricsService.summary(projectId));
});
