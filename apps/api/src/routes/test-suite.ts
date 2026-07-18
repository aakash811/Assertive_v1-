import { Hono } from "hono";
import { ok } from "../lib/api-response";

import { apiKeyAuth } from "../middleware/api-key-auth";

import type { HonoVariables } from "../types/hono";

import { testSuiteService } from "../services/test-suite.service";

export const testSuiteRoutes = new Hono<{
  Variables: HonoVariables;
}>();

testSuiteRoutes.use("*", apiKeyAuth);

testSuiteRoutes.get("/", async (c) => {
  const projectId = c.get("projectId");

  return c.json(ok(await testSuiteService.list(projectId)));
});

testSuiteRoutes.post("/", async (c) => {
  const projectId = c.get("projectId");

  const body = await c.req.json();

  return c.json(
    ok(
      await testSuiteService.create({
        name: body.name,
        parentId: body.parentId,
        projectId,
      }),
    ),
    201,
  );
});

testSuiteRoutes.post("/:suiteId/test-cases/:testCaseId", async (c) => {
  const projectId = c.get("projectId");

  return c.json(
    ok(
      await testSuiteService.assignTestCase(
        projectId,
        c.req.param("suiteId"),
        c.req.param("testCaseId"),
      ),
    ),
  );
});

testSuiteRoutes.patch("/:id", async (c) => {
  const projectId = c.get("projectId");
  const body = await c.req.json();

  return c.json(
    ok(
      await testSuiteService.update(c.req.param("id"), projectId, {
        name: body.name,
        parentId: body.parentId,
      }),
    ),
  );
});

testSuiteRoutes.delete("/:id", async (c) => {
  const projectId = c.get("projectId");

  await testSuiteService.delete(c.req.param("id"), projectId);

  return c.json(
    ok({
      success: true,
    }),
  );
});
