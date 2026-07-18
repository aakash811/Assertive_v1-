import { Hono } from "hono";
import { ok } from "../lib/api-response";
import { cleanupService } from "../services/cleanup.service";
import { apiKeyAuth } from "../middleware/api-key-auth";

export const cleanupRoutes = new Hono();

cleanupRoutes.use("*", apiKeyAuth);

cleanupRoutes.post(
  "/cleanup",

  async (c) => {
    return c.json(ok(await cleanupService.run()));
  },
);
