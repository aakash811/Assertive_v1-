import { Hono } from "hono";
import { ok } from "../lib/api-response";
import { cleanupService } from "../services/cleanup.service";

export const cleanupRoutes = new Hono();

cleanupRoutes.post(
  "/cleanup",

  async (c) => {
    return c.json(ok(await cleanupService.run()));
  },
);
