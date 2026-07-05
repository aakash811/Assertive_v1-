import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(async (fn) => fn()),
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
    findUploadState: vi.fn(),
    markUploaded: vi.fn(),
  },
}));

vi.mock("../../services/execution-engine.service", () => ({
  executionEngineService: {
    execute: vi.fn(),
  },
}));

import { runBatchRepository } from "../../repositories/run-batch.repository";
import { runBatchService } from "../../services/run-batch.service";
import { executionEngineService } from "../../services/execution-engine.service";

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
    vi.mocked(runBatchRepository.findUploadState).mockResolvedValue({
      id: "batch-1",
      uploadCompleted: false,
    } as any);

    vi.mocked(executionEngineService.execute).mockResolvedValue(1);

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

    expect(executionEngineService.execute).toHaveBeenCalledWith(
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

    expect(runBatchRepository.markUploaded).toHaveBeenCalledWith("batch-1");
  });

  it("throws for execution failure", async () => {
    vi.mocked(runBatchRepository.findUploadState).mockResolvedValue({
      id: "batch-1",
      uploadCompleted: false,
    } as any);

    vi.mocked(executionEngineService.execute).mockRejectedValue(
      new AppError(
        "TEST_CASE_NOT_FOUND",
        "Unknown test",
        404,
      ),
    );

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

  it("returns immediately when upload is already completed", async () => {
    vi.mocked(runBatchRepository.findUploadState).mockResolvedValue({
      id: "batch-1",
      uploadCompleted: true,
    } as any);

    const result = await runBatchService.upload(
      "batch-1",
      "project-1",
      [],
    );

    expect(result).toEqual({
      uploaded: 0,
    });

    expect(executionEngineService.execute).not.toHaveBeenCalled();
  });
});
