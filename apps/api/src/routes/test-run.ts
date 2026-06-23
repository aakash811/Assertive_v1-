import { Hono } from "hono";
import { ok, paginated } from "../lib/api-response";
import type { HonoVariables } from "../types/hono";
import { createTestRunSchema } from "../validators/test-run.validators";
import { testRunService } from "../services/test-run.service";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

export const testRunRoutes = new Hono<{
  Variables: HonoVariables;
}>();

testRunRoutes.post("/", async (c) => {
  const body = createTestRunSchema.parse(await c.req.json());
  const testRun = await testRunService.create(body);

  return c.json(ok(testRun), 201);
});

testRunRoutes.get("/", async (c) => {
  const projectId = c.get("projectId");
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;

  const result = await testRunService.list(projectId, page, limit);

  return c.json(
    paginated(result.items, {
      page,
      limit,
      total: result.total,
    }),
  );
});

testRunRoutes.get("/:id", async (c) => {
  const projectId = c.get("projectId");
  const testRun = await testRunService.get(c.req.param("id"), projectId);

  if (!testRun) {
    throw new AppError(
      ERROR_CODES.TEST_RUN_NOT_FOUND,
      "Test run not found",
      404,
    );
  }

  return c.json(ok(testRun));
});
