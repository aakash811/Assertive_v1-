import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/prisma", () => ({
  prisma: {
    runBatch: {
      update: vi.fn(),
    },

    testCase: {
      findUnique: vi.fn(),

      update: vi.fn(),
    },
  },
}));

vi.mock("../../repositories/test-run.repository", () => ({
  testRunRepository: {
    create: vi.fn(),

    findMany: vi.fn(),

    findById: vi.fn(),
  },
}));

vi.mock("../../services/flakiness.service", () => ({
  flakinessService: {
    recalculate: vi.fn(),
  },
}));

vi.mock("../../services/history.service", () => ({
  historyService: {
    statusChanged: vi.fn(),
    manualOverrideCleared: vi.fn(),
  },
}));

import { prisma } from "../../lib/prisma";

import { testRunRepository } from "../../repositories/test-run.repository";

import { flakinessService } from "../../services/flakiness.service";

import { historyService } from "../../services/history.service";

import { testRunService } from "../../services/test-run.service";

describe("testRunService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates passed run", async () => {
    vi.mocked(testRunRepository.create).mockResolvedValue({
      testCaseId: "tc-1",

      runBatchId: "batch-1",

      status: "PASSED",
    } as never);

    vi.mocked(prisma.testCase.findUnique).mockResolvedValue({
      isManualOverride: false,
    } as never);

    await testRunService.create({
      testCaseId: "tc-1",

      runBatchId: "batch-1",

      status: "PASSED",
    });

    expect(prisma.runBatch.update).toHaveBeenCalledWith({
      where: {
        id: "batch-1",
      },

      data: {
        totalCount: {
          increment: 1,
        },

        passedCount: {
          increment: 1,
        },
      },
    });

    expect(prisma.testCase.update).toHaveBeenCalledWith({
      where: {
        id: "tc-1",
      },

      data: {
        lastStatus: "PASSED",

        isManualOverride: false,

        overrideComment: null,
      },
    });

    expect(historyService.statusChanged).toHaveBeenCalledWith(
      "tc-1",
      {
        status: {
          from: undefined,
          to: "PASSED",
        },
      },
    );

    expect(flakinessService.recalculate).toHaveBeenCalledWith("tc-1");
  });

  it("creates failed run", async () => {
    vi.mocked(testRunRepository.create).mockResolvedValue({
      testCaseId: "tc-1",

      runBatchId: "batch-1",

      status: "FAILED",
    } as never);

    vi.mocked(prisma.testCase.findUnique).mockResolvedValue({
      isManualOverride: false,
    } as never);

    await testRunService.create({
      testCaseId: "tc-1",

      runBatchId: "batch-1",

      status: "FAILED",
    });

    expect(prisma.runBatch.update).toHaveBeenCalledWith({
      where: {
        id: "batch-1",
      },

      data: {
        totalCount: {
          increment: 1,
        },

        failedCount: {
          increment: 1,
        },
      },
    });
  });

  it("clears manual override", async () => {
    vi.mocked(testRunRepository.create).mockResolvedValue({
      testCaseId: "tc-1",

      runBatchId: "batch-1",

      status: "PASSED",
    } as never);

    vi.mocked(prisma.testCase.findUnique).mockResolvedValue({
      isManualOverride: true,
    } as never);

    await testRunService.create({
      testCaseId: "tc-1",

      runBatchId: "batch-1",

      status: "PASSED",
    });

   expect(historyService.manualOverrideCleared).toHaveBeenCalledWith("tc-1");
  });

  it("delegates list and get", async () => {
    await testRunService.list(
      "project-1",
      1,
      20,
    );

    await testRunService.get(
      "run-1",
      "project-1",
    );

    expect(testRunRepository.findMany).toHaveBeenCalledWith(
      "project-1",
      1,
      20,
      undefined
    );

    expect(testRunRepository.findById).toHaveBeenCalledWith(
      "run-1",
      "project-1",
    );
  });
});
