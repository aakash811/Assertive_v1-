import { Hono } from "hono";

import type { HonoVariables } from "../types/hono";

import { testCaseService } from "../services/test-case.service";

import {
  createTestCaseSchema,
  discoverTestCasesSchema,
  updateTestCaseSchema,
} from "../validators/test-case.validator";

export const testCaseRoutes = new Hono<{
  Variables: HonoVariables;
}>();

testCaseRoutes.post("/", async (c) => {
  const body = createTestCaseSchema.parse(await c.req.json());

  const projectId = c.get("projectId");

  const testCase = await testCaseService.create(projectId, body);

  return c.json(testCase, 201);
});

testCaseRoutes.get("/", async (c) => {
  const projectId = c.get("projectId");
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;

  const testCases = await testCaseService.list(projectId, page, limit);

  return c.json({
    items: testCases.items,

    pagination: {
      page,
      limit,
      total: testCases.total,
      totalPages: Math.ceil(testCases.total / limit),
    },
  });
});

testCaseRoutes.get("/by-unique-id/:uniqueId", async (c) => {
  const projectId = c.get("projectId");

  const testCase = await testCaseService.findByUniqueId(
    c.req.param("uniqueId"),
    projectId,
  );

  if (!testCase) {
    return c.json(
      {
        error: "Test case not found",
      },
      404,
    );
  }

  return c.json(testCase);
});

testCaseRoutes.post("/discover", async (c) => {
  const body = discoverTestCasesSchema.parse(await c.req.json());

  const projectId = c.get("projectId");

  const existing = await testCaseService.findByUniqueId(
    body.uniqueId,
    projectId,
  );

  if (existing) {
    return c.json(existing);
  }

  const testCase = await testCaseService.create(projectId, {
    uniqueId: body.uniqueId,
    title: body.title,
  });

  return c.json(testCase, 201);
});

testCaseRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const projectId = c.get("projectId");

  const testCase = await testCaseService.get(id, projectId);

  if (!testCase) {
    return c.json(
      {
        error: "Test case not found",
      },
      404,
    );
  }

  return c.json(testCase);
});

testCaseRoutes.patch("/:id", async (c) => {
  const id = c.req.param("id");

  const body = updateTestCaseSchema.parse(await c.req.json());

  const projectId = c.get("projectId");

  const updated = await testCaseService.update(id, body, projectId);

  return c.json(updated);
});

testCaseRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const projectId = c.get("projectId");

  await testCaseService.delete(id, projectId);

  return c.json({
    success: true,
  });
});
