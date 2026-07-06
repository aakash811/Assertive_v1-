import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/test-case.repository", () => ({
  testCaseRepository: {
    withTransaction: vi.fn(async (callback) => callback()),
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

vi.mock("../../utils/history-diff", () => ({
  generateMetadataDiff: vi.fn(),
}));

import { testCaseRepository } from "../../repositories/test-case.repository";
import { testSuiteRepository } from "../../repositories/test-suite.repository";
import { tagRepository } from "../../repositories/tag.repository";
import { testCaseTagRepository } from "../../repositories/test-case-tag.repository";
import { historyService } from "../../services/history.service";
import { generateMetadataDiff } from "../../utils/history-diff";
import { syncService } from "../../services/sync.service";
import { create } from "domain";

describe("syncService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(testSuiteRepository.findByProject).mockResolvedValue([]);

    vi.mocked(tagRepository.findByProject).mockResolvedValue([]);

    vi.mocked(testSuiteRepository.create).mockResolvedValue({
      id: "suite-1",
      name: "Authentication",
    } as any);

    vi.mocked(tagRepository.create).mockResolvedValue({
      id: "tag-1",
      name: "smoke",
    } as any);
  });

  it("creates new test cases", async () => {
    vi.mocked(testCaseRepository.findByProject).mockResolvedValue([]);

    vi.mocked(testCaseRepository.upsert).mockResolvedValue({
      id: "tc-1",
    } as any);

    const result = await syncService.sync(
      "project-1",

      [
        {
          externalId: "auth.login",

          title: "Login",

          filePath: "login.spec.ts",

          tags: [],

          customFields: {},
        },
      ],
    );

    expect(result.created).toBe(1);

    expect(historyService.created).toHaveBeenCalledWith("tc-1");
  });

  it("updates existing test cases", async () => {
    vi.mocked(testCaseRepository.findByProject).mockResolvedValue([
      {
        id: "tc-1",
        externalId: "auth.login",
        syncState: "SYNCED",
      },
    ] as any);

    vi.mocked(testCaseRepository.upsert).mockResolvedValue({
      id: "tc-1",
    } as any);

    vi.mocked(generateMetadataDiff).mockReturnValue({
      title: {},
    });

    const result = await syncService.sync(
      "project-1",

      [
        {
          externalId: "auth.login",

          title: "Login",

          filePath: "login.spec.ts",

          tags: [],

          customFields: {},
        },
      ],
    );

    expect(result.updated).toBe(1);

    expect(historyService.updated).toHaveBeenCalled();
  });

  it("restores stale tests", async () => {
    vi.mocked(testCaseRepository.findByProject).mockResolvedValue([
      {
        id: "tc-1",
        externalId: "auth.login",
        syncState: "STALE",
      },
    ] as any);

    vi.mocked(testCaseRepository.upsert).mockResolvedValue({
      id: "tc-1",
    } as any);

    const result = await syncService.sync(
      "project-1",
      [
        {
          externalId: "auth.login",
          title: "Login",
          filePath: "login.spec.ts",
          tags: [],
          customFields: {},
        },
      ],
    );

    expect(result.restored).toBe(1);

    expect(historyService.restored).toHaveBeenCalledWith("tc-1");
  });

  it("marks missing tests as stale", async () => {
    vi.mocked(testCaseRepository.findByProject).mockResolvedValue([
      {
        id: "tc-1",
        externalId: "old.test",
        syncState: "SYNCED",
      },
    ] as any);

    const result = await syncService.sync(
      "project-1",

      [],
    );

    expect(result.stale).toBe(1);
    expect(testCaseRepository.markStale).toHaveBeenCalledWith("tc-1");
    expect(historyService.stale).toHaveBeenCalledWith("tc-1");
  });
});
