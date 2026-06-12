import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { testRunRepository } from "../repositories/test-run.repository";
import { flakinessService } from "./flakiness.service";
import { historyService } from "./history.service";

export const testRunService = {
  async create(data: Prisma.TestRunUncheckedCreateInput) {
    const run = await testRunRepository.create(data);

    const updateData: Prisma.RunBatchUpdateInput = {
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

    await flakinessService.recalculate(run.testCaseId);
    return run;
  },

  list(projectId: string, page: number, limit: number) {
    return testRunRepository.findMany(projectId, page, limit);
  },

  get(id: string, projectId: string) {
    return testRunRepository.findById(id, projectId);
  },
};
