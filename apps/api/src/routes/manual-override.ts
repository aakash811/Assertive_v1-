import { Hono } from "hono";
import { apiKeyAuth } from "../middleware/api-key-auth";
import type { HonoVariables } from "../types/hono";
import { manualOverrideService } from "../services/manual-override.service";

export const manualOverrideRoutes = new Hono<{
  Variables: HonoVariables;
}>();

manualOverrideRoutes.use("*", apiKeyAuth);

manualOverrideRoutes.post("/test-cases/:id/status", async (c) => {
  const body = await c.req.json();

  return c.json(
    await manualOverrideService.overrideStatus(c.req.param("id"), body.status),
  );
});
