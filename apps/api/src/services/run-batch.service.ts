import { prisma } from "../lib/prisma";
import { runBatchRepository } from "../repositories/run-batch.repository";
import { testRunService } from "./test-run.service";

export const runBatchService = {
  create(projectId: string, data: any) {
    return runBatchRepository.create({
      ...data,
      projectId,
    });
  },

  list(projectId: string) {
    return runBatchRepository.findMany(projectId);
  },

  get(id: string, projectId: string) {
    return runBatchRepository.findById(id, projectId);
  },

  async upload(batchId: string, projectId: string, results: any[]) {
    for (const result of results) {
      const testCase = await prisma.testCase.findFirst({
        where: {
          uniqueId: result.uniqueId,
          projectId,
        },
      });

      if (!testCase) {
        continue;
      }

      await testRunService.create({
        testCaseId: testCase.id,
        runBatchId: batchId,
        status: result.status,
        durationMs: result.durationMs,
        errorMessage: result.errorMessage,
        traceUrl: result.traceUrl,
      });
    }

    return {
      uploaded: results.length,
    };
  },
};
