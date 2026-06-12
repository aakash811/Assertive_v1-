import { Hono } from "hono";
import type { HonoVariables } from "../types/hono";
import {
  createRunBatchSchema,
  uploadResultsSchema,
} from "../validators/run-batch.validator";
import { runBatchService } from "../services/run-batch.service";

export const runBatchRoutes = new Hono<{
  Variables: HonoVariables;
}>();

runBatchRoutes.post("/", async (c) => {
  const body = createRunBatchSchema.parse(await c.req.json());
  const projectId = c.get("projectId");
  const batch = await runBatchService.create(projectId, body);

  return c.json(batch, 201);
});

runBatchRoutes.post("/:id/upload", async (c) => {
  const projectId = c.get("projectId");
  const batchId = c.req.param("id");

  const body = uploadResultsSchema.parse(await c.req.json());

  const result = await runBatchService.upload(batchId, projectId, body.results);

  return c.json(result);
});

runBatchRoutes.get("/", async (c) => {
  const projectId = c.get("projectId");
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;

  const result = await runBatchService.list(projectId, page, limit);

  return c.json({
    items: result.items,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  });
});

runBatchRoutes.get("/:id", async (c) => {
  const projectId = c.get("projectId");
  const batch = await runBatchService.get(c.req.param("id"), projectId);

  if (!batch) {
    return c.json({ error: "Not Found" }, 404);
  }

  return c.json(batch);
});
