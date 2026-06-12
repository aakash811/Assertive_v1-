import { prisma } from "../lib/prisma";
import { runBatchRepository } from "../repositories/run-batch.repository";
import {
  BatchUploadResult,
  CreateRunBatchDto,
} from "../validators/run-batch.validator";
import { testRunService } from "./test-run.service";
import { TestStatus } from "@prisma/client";

export const runBatchService = {
  create(projectId: string, data: CreateRunBatchDto) {
    return runBatchRepository.create({
      ...data,
      projectId,
    });
  },

  list(projectId: string, page: number, limit: number) {
    return runBatchRepository.findMany(projectId, page, limit);
  },

  get(id: string, projectId: string) {
    return runBatchRepository.findById(id, projectId);
  },

  async upload(
    batchId: string,
    projectId: string,
    results: BatchUploadResult[],
  ) {
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
        status: result.status as TestStatus,
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
