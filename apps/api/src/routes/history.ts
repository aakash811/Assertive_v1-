import { Hono } from "hono";
import { paginated } from "../lib/api-response";
import { getPagination } from "../lib/pagination";
import type { HonoVariables } from "../types/hono";
import { historyService } from "../services/history.service";

export const historyRoutes = new Hono<{
  Variables: HonoVariables;
}>();

historyRoutes.get("/test-cases/:id/history", async (c) => {
  const { page, limit } = getPagination(
    c.req.query("page"),
    c.req.query("limit"),
  );

  const history = await historyService.list(c.req.param("id"), page, limit);

  return c.json(
    paginated(history.items, {
      page,
      limit,
      total: history.total,
    }),
  );
});

historyRoutes.get("/history/:externalId", async (c) => {
  const projectId = c.get("projectId");

  const { page, limit } = getPagination(
    c.req.query("page"),
    c.req.query("limit"),
  );

  const history = await historyService.listByExternalId(
    projectId,
    c.req.param("externalId"),
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
