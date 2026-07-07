import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/test-case.repository", () => ({
  testCaseRepository: {
    withTransaction: vi.fn((cb) => cb()),
    findByProject: vi.fn().mockResolvedValue([]),
    upsert: vi.fn(),
    markStale: vi.fn(),
  },
}));

vi.mock("../../repositories/test-suite.repository", () => ({
  testSuiteRepository: {
    findByProject: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
  },
}));

vi.mock("../../repositories/tag.repository", () => ({
  tagRepository: {
    findByProject: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
  },
}));

vi.mock("../../repositories/test-case-tag.repository", () => ({
  testCaseTagRepository: {
    syncTags: vi.fn(),
  },
}));

vi.mock("../../services/history.service", () => ({
  historyService: {
    created: vi.fn(),
    updated: vi.fn(),
    restored: vi.fn(),
    stale: vi.fn(),
  },
}));

vi.mock("../../services/sync-lock.service", () => ({
  syncLockService: {
    acquire: vi.fn(() => true),
    release: vi.fn(),
  },
}));

vi.mock("../../utils/history-diff", () => ({
  generateMetadataDiff: vi.fn(() => ({})),
}));

import type { SyncTestCase } from "@assertive/shared";

import { syncService } from "../../services/sync.service";
import { testCaseRepository } from "../../repositories/test-case.repository";
import { syncLockService } from "../../services/sync-lock.service";
import { AppError } from "../../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

function makeTestCase(): SyncTestCase {
  return {
    externalId: "login",
    title: "Login",
    filePath: "tests/login.spec.ts",
    owner: undefined,
    priority: undefined,
    suite: undefined,
    testType: undefined,
    tags: [],
    customFields: {},
  };
}

describe("sync transaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("executes inside transaction", async () => {
    vi.mocked(testCaseRepository.upsert).mockResolvedValue({
      id: "tc-1",
    } as never);

    await syncService.sync("project-1", [makeTestCase()]);

    expect(testCaseRepository.withTransaction).toHaveBeenCalledTimes(1);
  });

  it("releases lock when transaction fails", async () => {
    vi.mocked(testCaseRepository.upsert).mockRejectedValue(new Error("boom"));

    await expect(
      syncService.sync("project-1", [makeTestCase()]),
    ).rejects.toThrow("boom");

    expect(syncLockService.release).toHaveBeenCalledWith("project-1");
  });

  it("rejects when another sync is already running", async () => {
    vi.mocked(syncLockService.acquire).mockReturnValue(false);

    await expect(
      syncService.sync("project-1", [makeTestCase()]),
    ).rejects.toMatchObject({
      code: ERROR_CODES.CONFLICT,
    });

    expect(syncLockService.release).not.toHaveBeenCalled();
  });
});
