import { Hono } from "hono";

import type { HonoVariables } from "../types/hono";

import { historyService } from "../services/history.service";

export const historyRoutes = new Hono<{
  Variables: HonoVariables;
}>();

historyRoutes.get("/test-cases/:id/history", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const history = await historyService.list(c.req.param("id"), page, limit);

  return c.json({
    items: history.items,
    pagination: {
      page,
      limit,
      total: history.total,
      totalPages: Math.ceil(history.total / limit),
    },
  });
});

historyRoutes.get("/history/:uniqueId", async (c) => {
  const projectId = c.get("projectId");
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;

  const history = await historyService.listByUniqueId(
    projectId,
    c.req.param("uniqueId"),
    page,
    limit,
  );

  return c.json({
    items: history.items,

    pagination: {
      page,
      limit,
      total: history.total,
      totalPages: Math.ceil(history.total / limit),
    },
  });
});
