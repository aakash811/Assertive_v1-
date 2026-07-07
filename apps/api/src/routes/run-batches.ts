import { Hono } from "hono";
import { ok, paginated } from "../lib/api-response";
import type { HonoVariables } from "../types/hono";
import {
  createRunBatchSchema,
  uploadResultsSchema,
} from "../validators/run-batch.validator";
import { runBatchService } from "../services/run-batch.service";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";
import { getPagination } from "../lib/pagination";

export const runBatchRoutes = new Hono<{
  Variables: HonoVariables;
}>();

runBatchRoutes.post("/", async (c) => {
  const body = createRunBatchSchema.parse(await c.req.json());
  const projectId = c.get("projectId");
  const batch = await runBatchService.create(projectId, body);

  return c.json(ok(batch), 201);
});

runBatchRoutes.post("/:id/upload", async (c) => {
  const projectId = c.get("projectId");
  const batchId = c.req.param("id");

  const body = uploadResultsSchema.parse(await c.req.json());

  const result = await runBatchService.upload(batchId, projectId, body.results);

  return c.json(ok(result));
});

runBatchRoutes.get("/", async (c) => {
  const projectId = c.get("projectId");
  const { page, limit } = getPagination(
    c.req.query("page"),
    c.req.query("limit"),
  );
  const q = c.req.query("q");
  const environment = c.req.query("environment");
  const triggeredBy = c.req.query("triggeredBy");

  const result = await runBatchService.list(projectId, {
    page,
    limit,
    q,
    environment,
    triggeredBy,
  });

  return c.json(
    paginated(result.items, {
      page,
      limit,
      total: result.total,
    }),
  );
});

runBatchRoutes.get("/:id", async (c) => {
  const projectId = c.get("projectId");
  const batch = await runBatchService.get(c.req.param("id"), projectId);

  if (!batch) {
    throw new AppError(
      ERROR_CODES.RUN_BATCH_NOT_FOUND,
      "Run batch not found",
      404,
    );
  }

  return c.json(ok(batch));
});
