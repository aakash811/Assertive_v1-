import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/prisma", () => ({
  prisma: {
    testCase: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },

    testSuite: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },

    tag: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },

    testCaseTag: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("../../repositories/history.repository", () => ({
  historyRepository: {
    create: vi.fn(),
  },
}));

vi.mock("../../utils/history-diff", () => ({
  generateMetadataDiff: vi.fn(),
}));

import { prisma } from "../../lib/prisma";

import { historyRepository } from "../../repositories/history.repository";

import { generateMetadataDiff } from "../../utils/history-diff";

import { syncService } from "../../services/sync.service";

describe("syncService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(prisma.testSuite.findFirst).mockResolvedValue(null as never);

    vi.mocked(prisma.tag.findFirst).mockResolvedValue(null as never);

    vi.mocked(prisma.testSuite.create).mockResolvedValue({
      id: "suite-1",
    } as never);

    vi.mocked(prisma.tag.create).mockResolvedValue({
      id: "tag-1",
    } as never);

    vi.mocked(generateMetadataDiff).mockReturnValue({});
  });

  it("creates new test cases", async () => {
    vi.mocked(prisma.testCase.findMany).mockResolvedValue([]);

    vi.mocked(prisma.testCase.upsert).mockResolvedValue({
      id: "tc-1",
    } as never);

    const result = await syncService.sync(
      "project-1",

      [
        {
          uniqueId: "auth.login",

          title: "Login",

          filePath: "login.spec.ts",

          tags: [],

          customFields: {},
        },
      ],
    );

    expect(result.created).toBe(1);

    expect(historyRepository.create).toHaveBeenCalledWith({
      testCaseId: "tc-1",

      action: "CREATED",
    });
  });

  it("updates existing test cases", async () => {
    vi.mocked(prisma.testCase.findMany).mockResolvedValue([
      {
        id: "tc-1",

        uniqueId: "auth.login",

        syncState: "SYNCED",
      },
    ] as never);

    vi.mocked(prisma.testCase.upsert).mockResolvedValue({
      id: "tc-1",
    } as never);

    vi.mocked(generateMetadataDiff).mockReturnValue({
      title: {},
    });

    const result = await syncService.sync(
      "project-1",

      [
        {
          uniqueId: "auth.login",

          title: "Login",

          filePath: "login.spec.ts",

          tags: [],

          customFields: {},
        },
      ],
    );

    expect(result.updated).toBe(1);

    expect(historyRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "UPDATED",
      }),
    );
  });

  it("restores stale tests", async () => {
    vi.mocked(prisma.testCase.findMany).mockResolvedValue([
      {
        id: "tc-1",

        uniqueId: "auth.login",

        syncState: "STALE",
      },
    ] as never);

    vi.mocked(prisma.testCase.upsert).mockResolvedValue({
      id: "tc-1",
    } as never);

    const result = await syncService.sync(
      "project-1",

      [
        {
          uniqueId: "auth.login",

          title: "Login",

          filePath: "login.spec.ts",

          tags: [],

          customFields: {},
        },
      ],
    );

    expect(result.restored).toBe(1);

    expect(historyRepository.create).toHaveBeenCalledWith({
      testCaseId: "tc-1",

      action: "RESTORED",
    });
  });

  it("marks missing tests as stale", async () => {
    vi.mocked(prisma.testCase.findMany).mockResolvedValue([
      {
        id: "tc-1",

        uniqueId: "old.test",

        syncState: "SYNCED",
      },
    ] as never);

    const result = await syncService.sync(
      "project-1",

      [],
    );

    expect(result.stale).toBe(1);

    expect(prisma.testCase.update).toHaveBeenCalledWith({
      where: {
        id: "tc-1",
      },

      data: {
        syncState: "STALE",
      },
    });
  });
});
