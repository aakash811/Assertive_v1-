import { Hono } from "hono";
import { ok } from "../lib/api-response";
import { apiKeyAuth } from "../middleware/api-key-auth";
import type { HonoVariables } from "../types/hono";
import { statusService } from "../services/status.service";

export const statusRoutes = new Hono<{
  Variables: HonoVariables;
}>();

statusRoutes.use("*", apiKeyAuth);

statusRoutes.get("/", async (c) => {
  const projectId = c.get("projectId");

  return c.json(ok(await statusService.get(projectId)));
});
