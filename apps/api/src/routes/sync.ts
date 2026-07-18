import { Hono } from "hono";
import type { Context } from "hono";
import { apiKeyAuth } from "../middleware/api-key-auth";
import type { HonoVariables } from "../types/hono";
import { syncService } from "../services/sync.service";
import { ERROR_CODES } from "@assertive/shared";
import { AppError } from "../lib/app-error";
import { ok } from "../lib/api-response";
import { syncPayloadSchema } from "../validators/sync.validator";

export const syncRoutes = new Hono<{
  Variables: HonoVariables;
}>();

syncRoutes.use("*", apiKeyAuth);

async function handleSync(c: Context<{ Variables: HonoVariables }>) {
  const projectId = c.get("projectId");
  const routeProjectId = c.req.param("id");

  if (routeProjectId && routeProjectId !== projectId) {
    throw new AppError(ERROR_CODES.PERMISSION_DENIED, "Project mismatch", 403);
  }

  const body = syncPayloadSchema.parse(await c.req.json());

  return c.json(ok(await syncService.sync(projectId, body.testCases)));
}

syncRoutes.post("/", handleSync);

syncRoutes.post("/projects/:id/sync", handleSync);
