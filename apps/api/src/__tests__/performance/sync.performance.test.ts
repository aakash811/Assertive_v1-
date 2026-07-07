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
  generateMetadataDiff: vi.fn(() => ({})),
}));

import type { SyncTestCase } from "@assertive/shared";

import { syncService } from "../../services/sync.service";
import { testCaseRepository } from "../../repositories/test-case.repository";
import { testSuiteRepository } from "../../repositories/test-suite.repository";
import { tagRepository } from "../../repositories/tag.repository";

describe("sync performance", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(testCaseRepository.findByProject).mockResolvedValue([]);
    vi.mocked(testSuiteRepository.findByProject).mockResolvedValue([]);
    vi.mocked(tagRepository.findByProject).mockResolvedValue([]);

    vi.mocked(testSuiteRepository.create).mockResolvedValue({
      id: "suite-1",
      name: "Auth",
    } as never);

    vi.mocked(tagRepository.create).mockResolvedValue({
      id: "tag-1",
      name: "smoke",
    } as never);

    vi.mocked(testCaseRepository.upsert).mockResolvedValue({
      id: "tc",
    } as never);
  });

  it("processes large sync payload efficiently", async () => {
    const payload: SyncTestCase[] = Array.from({ length: 1000 }, (_, i) => ({
      externalId: `test-${i}`,
      title: `Test ${i}`,
      filePath: `tests/test-${i}.spec.ts`,
      owner: undefined,
      priority: undefined,
      suite: "Auth",
      testType: undefined,
      tags: ["smoke"],
      customFields: {},
    }));

    const start = performance.now();

    const result = await syncService.sync("project-1", payload);

    const duration = performance.now() - start;

    expect(result.synced).toBe(1000);
    expect(result.created).toBe(1000);

    expect(testSuiteRepository.create).toHaveBeenCalledTimes(1);
    expect(tagRepository.create).toHaveBeenCalledTimes(1);
    expect(testCaseRepository.upsert).toHaveBeenCalledTimes(1000);

    // Loose threshold to catch regressions without being flaky on CI.
    expect(duration).toBeLessThan(3000);
  });
});
