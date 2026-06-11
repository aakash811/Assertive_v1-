import { Hono } from "hono";
import type { HonoVariables } from "../types/hono";
import { createTestRunSchema } from "../validators/test-run.validators";
import { testRunService } from "../services/test-run.service";

export const testRunRoutes = new Hono<{
  Variables: HonoVariables;
}>();

testRunRoutes.post("/", async (c) => {
  const body = createTestRunSchema.parse(await c.req.json());
  const testRun = await testRunService.create(body);

  return c.json(testRun, 201);
});

testRunRoutes.get("/", async (c) => {
  const projectId = c.get("projectId");

  return c.json(await testRunService.list(projectId));
});

testRunRoutes.get("/:id", async (c) => {
  const projectId = c.get("projectId");
  const testRun = await testRunService.get(c.req.param("id"), projectId);

  if (!testRun) {
    return c.json({ error: "Not Found" }, 404);
  }

  return c.json(testRun);
});
