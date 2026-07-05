import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/test-case.repository", () => ({
  testCaseRepository: {
    findByProject: vi.fn(),
    upsert: vi.fn(),
    markStale: vi.fn(),
  },
}));

vi.mock("../../repositories/test-suite.repository", () => ({
  testSuiteRepository: {
    findOrCreate: vi.fn(),
  },
}));

vi.mock("../../repositories/tag.repository", () => ({
  tagRepository: {
    findOrCreate: vi.fn(),
  },
}));

vi.mock("../../repositories/test-case-tag.repository", () => ({
  testCaseTagRepository: {
    replaceTags: vi.fn(),
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

describe("syncService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(testSuiteRepository.findOrCreate).mockResolvedValue({
      id: "suite-1",
    } as any);

    vi.mocked(tagRepository.findOrCreate).mockResolvedValue({
      id: "tag-1",
    } as any);

    vi.mocked(generateMetadataDiff).mockReturnValue({});
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
