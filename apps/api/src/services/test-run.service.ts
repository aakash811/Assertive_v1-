import { Prisma } from "@prisma/client";

import { testRunRepository } from "../repositories/test-run.repository";
import { runBatchRepository } from "../repositories/run-batch.repository";
import { testCaseRepository } from "../repositories/test-case.repository";

import { flakinessService } from "./flakiness.service";
import { historyService } from "./history.service";

export const testRunService = {
  async create(data: Prisma.TestRunUncheckedCreateInput) {
    const run = await testRunRepository.create(data);

    await runBatchRepository.incrementCounters(
      run.runBatchId,
      run.status,
    );

    const existing = await testCaseRepository.findRawById(
      run.testCaseId,
    );

    await testCaseRepository.clearManualOverride(
      run.testCaseId,
      run.status,
    );

    if (existing?.isManualOverride) {
      await historyService.manualOverrideCleared(run.testCaseId);
    }

    await historyService.statusChanged(
      run.testCaseId,
      {
        status: {
          from: existing?.lastStatus,
          to: run.status,
        },
      },
    );

    await flakinessService.recalculate(run.testCaseId);

    return run;
  },

  list(
    projectId: string,
    page: number,
    limit: number,
    testCaseId?: string,
  ) {
    return testRunRepository.findMany(
      projectId,
      page,
      limit,
      testCaseId,
    );
  },

  get(id: string, projectId: string) {
    return testRunRepository.findById(id, projectId);
  },
};