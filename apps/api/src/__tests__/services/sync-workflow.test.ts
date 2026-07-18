import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/test-case.repository", () => ({
  testCaseRepository: {
    withTransaction: vi.fn((cb) => cb()),
    findByProject: vi.fn(),
    upsert: vi.fn(),
    markStale: vi.fn(),
  },
}));

vi.mock("../../repositories/test-suite.repository", () => ({
  testSuiteRepository: {
    findByProject: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../repositories/tag.repository", () => ({
  tagRepository: {
    findByProject: vi.fn(),
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
  generateMetadataDiff: vi.fn(() => ({
    title: {
      from: "Old title",
      to: "New title",
    },
  })),
}));

import { syncService } from "../../services/sync.service";

import { testCaseRepository } from "../../repositories/test-case.repository";
import { testSuiteRepository } from "../../repositories/test-suite.repository";
import { tagRepository } from "../../repositories/tag.repository";
import { testCaseTagRepository } from "../../repositories/test-case-tag.repository";
import { historyService } from "../../services/history.service";
import { syncLockService } from "../../services/sync-lock.service";
import type { SyncTestCase } from "@assertive/shared";

function makeTestCase(overrides: Partial<SyncTestCase> = {}): SyncTestCase {
  return {
    externalId: "login",
    title: "Login",
    filePath: "tests/login.spec.ts",
    suite: undefined,
    owner: undefined,
    priority: undefined,
    testType: undefined,
    tags: [],
    customFields: {},
    ...overrides,
  };
}

describe("sync workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(testSuiteRepository.findByProject).mockResolvedValue([]);
    vi.mocked(tagRepository.findByProject).mockResolvedValue([]);
  });

  it("creates new inventory", async () => {
    vi.mocked(testCaseRepository.findByProject).mockResolvedValue([]);

    vi.mocked(testSuiteRepository.create).mockResolvedValue({
      id: "suite-1",
      name: "Auth",
    } as never);

    vi.mocked(tagRepository.create).mockResolvedValue({
      id: "tag-1",
      name: "smoke",
    } as never);

    vi.mocked(testCaseRepository.upsert).mockResolvedValue({
      id: "tc-1",
      externalId: "login",
    } as never);

    const result = await syncService.sync("project-1", [
      makeTestCase({
        suite: "Auth",
        tags: ["smoke"],
      }),
    ]);

    expect(result).toEqual({
      synced: 1,
      created: 1,
      updated: 0,
      restored: 0,
      stale: 0,
    });

    expect(historyService.created).toHaveBeenCalledWith("tc-1");
    expect(testCaseTagRepository.syncTags).toHaveBeenCalled();
  });

  it("updates existing inventory", async () => {
    vi.mocked(testCaseRepository.findByProject).mockResolvedValue([
      {
        id: "tc-1",
        externalId: "login",
        title: "Old title",
        syncState: "SYNCED",
      } as never,
    ]);

    vi.mocked(testCaseRepository.upsert).mockResolvedValue({
      id: "tc-1",
    } as never);

    await syncService.sync("project-1", [
      makeTestCase({
        title: "New title",
      }),
    ]);

    expect(historyService.updated).toHaveBeenCalledTimes(1);
  });

  it("restores stale inventory", async () => {
    vi.mocked(testCaseRepository.findByProject).mockResolvedValue([
      {
        id: "tc-1",
        externalId: "login",
        title: "Login",
        syncState: "STALE",
      } as never,
    ]);

    vi.mocked(testCaseRepository.upsert).mockResolvedValue({
      id: "tc-1",
    } as never);

    const result = await syncService.sync("project-1", [makeTestCase()]);

    expect(result.restored).toBe(1);
    expect(historyService.restored).toHaveBeenCalledWith("tc-1");
  });

  it("marks removed tests as stale", async () => {
    vi.mocked(testCaseRepository.findByProject).mockResolvedValue([
      {
        id: "old-test",
        externalId: "removed",
        syncState: "SYNCED",
      } as never,
    ]);

    const result = await syncService.sync("project-1", []);

    expect(result.stale).toBe(1);

    expect(testCaseRepository.markStale).toHaveBeenCalledWith("old-test", "project-1");
    expect(historyService.stale).toHaveBeenCalledWith("old-test");
  });

  it("releases sync lock after completion", async () => {
    vi.mocked(testCaseRepository.findByProject).mockResolvedValue([]);

    await syncService.sync("project-1", []);

    expect(syncLockService.acquire).toHaveBeenCalledWith("project-1");
    expect(syncLockService.release).toHaveBeenCalledWith("project-1");
  });
});
