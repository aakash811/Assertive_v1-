import { prisma } from "../lib/prisma";
import { testRunRepository } from "../repositories/test-run.repository";
import { flakinessService } from "./flakiness.service";
import { historyService } from "./history.service";

export const testRunService = {
  async create(data: any) {
    const run = await testRunRepository.create(data);

    const updateData: any = {
      totalCount: {
        increment: 1,
      },
    };

    switch (run.status) {
      case "PASSED":
        updateData.passedCount = {
          increment: 1,
        };
        break;

      case "FAILED":
        updateData.failedCount = {
          increment: 1,
        };
        break;

      case "SKIPPED":
        updateData.skippedCount = {
          increment: 1,
        };
        break;
    }

    await prisma.runBatch.update({
      where: {
        id: run.runBatchId,
      },
      data: updateData,
    });

    await prisma.testCase.update({
      where: {
        id: run.testCaseId,
      },
      data: {
        lastStatus: run.status,
      },
    });

    await historyService.create({
      testCaseId: run.testCaseId,

      action: "STATUS_CHANGED",
      changes: {
        status: run.status,
      },
    });

    return run;

    await flakinessService.recalculate(run.testCaseId);
  },

  list(projectId: string) {
    return testRunRepository.findMany(projectId);
  },

  get(id: string, projectId: string) {
    return testRunRepository.findById(id, projectId);
  },
};
