import { Hono } from "hono";
import { paginated } from "../lib/api-response";
import type { HonoVariables } from "../types/hono";
import { historyService } from "../services/history.service";

export const historyRoutes = new Hono<{
  Variables: HonoVariables;
}>();

historyRoutes.get("/test-cases/:id/history", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const history = await historyService.list(c.req.param("id"), page, limit);

  return c.json(
    paginated(history.items, {
      page,
      limit,
      total: history.total,
    }),
  );
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

  return c.json(
    paginated(history.items, {
      page,
      limit,
      total: history.total,
    }),
  );
});
