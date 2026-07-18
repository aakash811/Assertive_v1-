import { Hono } from "hono";
import { ok, paginated } from "../lib/api-response";
import type { HonoVariables } from "../types/hono";
import { testCaseService } from "../services/test-case.service";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

import {
  createTestCaseSchema,
  updateTestCaseSchema,
  discoverTestCaseSchema,
} from "../validators/test-case.validator";
import { manualOverrideValidator } from "../validators/manual-override.validator";
import { manualOverrideService } from "../services/manual-override.service";
import { TestStatus } from "@prisma/client";
import { SyncState } from "@prisma/client";
import { getPagination } from "../lib/pagination";

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
  const { page, limit } = getPagination(
    c.req.query("page"),
    c.req.query("limit"),
  );
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

  const rawLifecycle = c.req.query("lifecycle");
  const lifecycle =
    rawLifecycle === "ACTIVE" || rawLifecycle === "ARCHIVED"
      ? rawLifecycle
      : undefined;

  const owner = c.req.query("owner");
  const tag = c.req.query("tag");
  const flaky = c.req.query("flaky");
  const suite = c.req.query("suite");
  const testType = c.req.query("testType") ?? c.req.query("type");
  const sort = c.req.query("sort");

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
    lifecycle,
    testType,
    sort: sort || undefined,
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

testCaseRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const projectId = c.get("projectId");

  const includeArchived = c.req.query("includeArchived") === "true";

  const testCase = await testCaseService.get(id, projectId, includeArchived);

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

testCaseRoutes.patch("/:id/archive", async (c) => {
  const id = c.req.param("id");
  const projectId = c.get("projectId");

  const archived = await testCaseService.archive(id, projectId);

  return c.json(ok(archived));
});

testCaseRoutes.patch("/:id/restore", async (c) => {
  const id = c.req.param("id");
  const projectId = c.get("projectId");

  const restored = await testCaseService.restore(id, projectId);

  return c.json(ok(restored));
});

testCaseRoutes.post("/discover", async (c) => {
  const body = discoverTestCaseSchema.parse(await c.req.json());
  const projectId = c.get("projectId");

  const existing = await testCaseService.findByExternalId(
    body.externalId,
    projectId,
    true,
  );

  if (existing) {
    return c.json(ok(existing));
  }

  const created = await testCaseService.create(projectId, {
    externalId: body.externalId,
    title: body.title,
    description: body.description,
    owner: body.owner,
    priority: body.priority,
    testType: body.testType,
    tags: body.tags,
  });

  return c.json(ok(created), 201);
});

testCaseRoutes.patch("/:id/override", async (c) => {
  const id = c.req.param("id");
  const body = manualOverrideValidator.parse(await c.req.json());
  const projectId = c.get("projectId");

  const result = await manualOverrideService.overrideStatus(
    projectId,
    id,
    body.status,
    body.comment,
  );

  return c.json(ok(result));
});
