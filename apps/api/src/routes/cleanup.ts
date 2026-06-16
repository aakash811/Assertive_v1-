import { Hono } from "hono";
import { cleanupService } from "../services/cleanup.services";

export const cleanupRoutes = new Hono();

cleanupRoutes.post(
  "/cleanup",

  async (c) => {
    return c.json(await cleanupService.run());
  },
);
