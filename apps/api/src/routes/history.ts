import { Hono } from "hono";

import type { HonoVariables } from "../types/hono";

import { historyService } from "../services/history.service";

export const historyRoutes = new Hono<{
  Variables: HonoVariables;
}>();

historyRoutes.get("/test-cases/:id/history", async (c) => {
  const history = await historyService.list(c.req.param("id"));

  return c.json(history);
});
