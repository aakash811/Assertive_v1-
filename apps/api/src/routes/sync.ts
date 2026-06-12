import { Hono } from "hono";

import { apiKeyAuth } from "../middleware/api-key-auth";

import type { HonoVariables } from "../types/hono";

import { syncService } from "../services/sync.service";

export const syncRoutes = new Hono<{
  Variables: HonoVariables;
}>();

syncRoutes.use("*", apiKeyAuth);

syncRoutes.post("/", async (c) => {
  const projectId = c.get("projectId");

  const body = await c.req.json();

  return c.json(await syncService.sync(projectId, body.testCases));
});
