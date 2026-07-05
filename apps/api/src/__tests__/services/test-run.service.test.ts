import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/test-run.repository", () => ({
  testRunRepository: {
    create: vi.fn(),

    findMany: vi.fn(),

    findById: vi.fn(),
  },
}));

vi.mock("../../repositories/test-case.repository", () => ({
  testCaseRepository: {
    findRawById: vi.fn(),
    clearManualOverride: vi.fn(),
  },
}));

vi.mock("../../repositories/run-batch.repository", () => ({
  runBatchRepository: {
    incrementCounters: vi.fn(),
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

import { testRunRepository } from "../../repositories/test-run.repository";
import { testCaseRepository } from "../../repositories/test-case.repository";
import { runBatchRepository } from "../../repositories/run-batch.repository";
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

    vi.mocked(testCaseRepository.findRawById).mockResolvedValue({
      isManualOverride: false,
    } as never);

    await testRunService.create({
      testCaseId: "tc-1",

      runBatchId: "batch-1",

      status: "PASSED",
    });

    expect(runBatchRepository.incrementCounters).toHaveBeenCalledWith(
      "batch-1",
      "PASSED",
    );

    expect(testCaseRepository.clearManualOverride).toHaveBeenCalledWith(
      "tc-1",
      "PASSED",
    );

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

   vi.mocked(testCaseRepository.findRawById).mockResolvedValue({
      lastStatus: undefined,
      isManualOverride: false,
    } as any);

    await testRunService.create({
      testCaseId: "tc-1",

      runBatchId: "batch-1",

      status: "FAILED",
    });

    expect(runBatchRepository.incrementCounters).toHaveBeenCalledWith(
      "batch-1",
      "FAILED",
    );
  });

  it("clears manual override", async () => {
    vi.mocked(testRunRepository.create).mockResolvedValue({
      testCaseId: "tc-1",
      runBatchId: "batch-1",
      status: "PASSED",
    } as never);

    vi.mocked(testCaseRepository.findRawById).mockResolvedValue({
      lastStatus: "FAILED",
      isManualOverride: true,
    } as any);

    await testRunService.create({
      testCaseId: "tc-1",
      runBatchId: "batch-1",
      status: "PASSED",
    });
    
    expect(testCaseRepository.clearManualOverride).toHaveBeenCalledWith(
      "tc-1",
      "PASSED",
    );
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
