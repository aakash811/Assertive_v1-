import { Hono } from "hono";
import { ok } from "../lib/api-response";
import { apiKeyAuth } from "../middleware/api-key-auth";
import type { HonoVariables } from "../types/hono";
import { manualOverrideService } from "../services/manual-override.service";
import { manualOverrideValidator } from "../validators/manual-override.validator";

export const manualOverrideRoutes = new Hono<{
  Variables: HonoVariables;
}>();

manualOverrideRoutes.use("*", apiKeyAuth);

manualOverrideRoutes.patch("/test-cases/:id/override", async (c) => {
  const body = manualOverrideValidator.parse(await c.req.json());

  return c.json(
    ok(
      await manualOverrideService.overrideStatus(
        c.req.param("id"),
        body.status,
        body.comment,
      ),
    ),
  );
});
