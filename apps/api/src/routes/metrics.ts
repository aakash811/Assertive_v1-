import { Hono } from "hono";
import { metricsService } from "../services/metrics.service";
import { HonoVariables } from "../types/hono";

export const metricsRoutes = new Hono<{ Variables: HonoVariables }>();

metricsRoutes.get("/summary", async (c) => {
  const result = await metricsService.getSummary(c.get("projectId"));

  return c.json(result);
});
