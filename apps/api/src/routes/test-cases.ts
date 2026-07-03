import { Hono } from "hono";
import { ok, paginated } from "../lib/api-response";
import type { HonoVariables } from "../types/hono";
import { testCaseService } from "../services/test-case.service";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

import {
  createTestCaseSchema,
  discoverTestCasesSchema,
  updateTestCaseSchema,
} from "../validators/test-case.validator";
import { TestStatus } from "@prisma/client";
import { SyncState } from "@prisma/client";

export const testCaseRoutes = new Hono<{
  Variables: HonoVariables;
}>();

testCaseRoutes.post("/", async (c) => {
  const body = createTestCaseSchema.parse(await c.req.json());
  const projectId = c.get("projectId");
  const testCase = await testCaseService.create(projectId, body);

  return c.json(ok(testCase), 201);
});

testCaseRoutes.get("/", async (c) => {
  const projectId = c.get("projectId");
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const q = c.req.query("q");
  const rawStatus = c.req.query("status");
  const status =
    rawStatus && Object.values(TestStatus).includes(rawStatus as TestStatus)
      ? (rawStatus as TestStatus)
      : undefined;

  const rawSyncState = c.req.query("syncState");
  const syncState =
    rawSyncState && Object.values(SyncState).includes(rawSyncState as SyncState)
      ? (rawSyncState as SyncState)
      : undefined;
  const owner = c.req.query("owner");
  const tag = c.req.query("tag");
  const flaky = c.req.query("flaky");
  const suite = c.req.query("suite");
  const testType = c.req.query("testType");

  const testCases = await testCaseService.list(projectId, {
    page,
    limit,
    q,
    status,
    owner,
    tag,
    flaky: flaky === undefined ? undefined : flaky === "true",
    suite,
    syncState,
    testType,
  });

  return c.json(
    paginated(testCases.items, {
      page,
      limit,
      total: testCases.total,
    }),
  );
});

testCaseRoutes.get("/by-external-id/:externalId", async (c) => {
  const projectId = c.get("projectId");

  const testCase = await testCaseService.findByExternalId(
    c.req.param("externalId"),
    projectId,
  );

  if (!testCase) {
    throw new AppError(
      ERROR_CODES.TEST_CASE_NOT_FOUND,
      "Test case not found",
      404,
    );
  }

  return c.json(ok(testCase));
});

testCaseRoutes.post("/discover", async (c) => {
  const body = discoverTestCasesSchema.parse(await c.req.json());
  const projectId = c.get("projectId");

  const existing = await testCaseService.findByExternalId(
    body.externalId,
    projectId,
  );

  if (existing) {
    return c.json(ok(existing));
  }

  const testCase = await testCaseService.create(projectId, {
    externalId: body.externalId,
    title: body.title,
  });

  return c.json(ok(testCase), 201);
});

testCaseRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const projectId = c.get("projectId");

  const testCase = await testCaseService.get(id, projectId);

  if (!testCase) {
    throw new AppError(
      ERROR_CODES.TEST_CASE_NOT_FOUND,
      "Test case not found",
      404,
    );
  }

  return c.json(ok(testCase));
});

testCaseRoutes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = updateTestCaseSchema.parse(await c.req.json());
  const projectId = c.get("projectId");

  const updated = await testCaseService.update(id, body, projectId);

  return c.json(ok(updated));
});

testCaseRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const projectId = c.get("projectId");

  await testCaseService.delete(id, projectId);

  return c.json(ok({ success: true }));
});
