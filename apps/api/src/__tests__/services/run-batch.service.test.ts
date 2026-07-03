import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/prisma", () => ({
  prisma: {
    testCase: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("../../repositories/run-batch.repository", () => ({
  runBatchRepository: {
    create: vi.fn(),
    findMany: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock("../../services/test-run.service", () => ({
  testRunService: {
    create: vi.fn(),
  },
}));

vi.mock("../../repositories/test-case.repository", () => ({
  testCaseRepository: {
    findByExternalId: vi.fn(),
  },
}));

import { prisma } from "../../lib/prisma";
import { runBatchRepository } from "../../repositories/run-batch.repository";
import { testCaseRepository } from "../../repositories/test-case.repository";
import { testRunService } from "../../services/test-run.service";
import { runBatchService } from "../../services/run-batch.service";
import { AppError } from "../../lib/app-error";

describe("runBatchService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates batch", async () => {
    await runBatchService.create("project-1", {
      branch: "main",
    });

    expect(runBatchRepository.create).toHaveBeenCalledWith({
      branch: "main",

      projectId: "project-1",
    });
  });

  it("lists batches", async () => {
    await runBatchService.list("project-1", {
      page: 1,
      limit: 20,
    });

    expect(runBatchRepository.findMany).toHaveBeenCalledWith("project-1", {
      page: 1,
      limit: 20,
    });
  });

  it("gets batch", async () => {
    await runBatchService.get(
      "batch-1",
      "project-1",
    );

    expect(runBatchRepository.findById).toHaveBeenCalledWith(
      "batch-1",
      "project-1",
    );
  });

  it("uploads results", async () => {
    vi.mocked(testCaseRepository.findByExternalId).mockResolvedValue({
      id: "tc-1",
    } as any);

    await runBatchService.upload(
      "batch-1",
      "project-1",

      [
        {
          externalId: "auth.login",
          status: "PASSED",
          durationMs: 100,
        },
      ],
    );

    expect(testRunService.create).toHaveBeenCalledWith({
      testCaseId: "tc-1",
      runBatchId: "batch-1",
      status: "PASSED",
      durationMs: 100,
      errorMessage: undefined,
      traceUrl: undefined,
    });
  });

  it("throws for unknown test case", async () => {
    vi.mocked(testCaseRepository.findByExternalId).mockResolvedValue(null);
    await expect(
      runBatchService.upload(
        "batch-1",
        "project-1",
        [
          {
            externalId: "missing",
            status: "PASSED",
          },
        ],
      ),
    ).rejects.toBeInstanceOf(AppError);
  });
});
