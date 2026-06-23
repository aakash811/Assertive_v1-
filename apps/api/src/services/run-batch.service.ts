import { Prisma } from "@prisma/client";
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

  list(
    projectId: string,
    filters: {
      page: number;
      limit: number;
      q?: string;
      environment?: string;
      triggeredBy?: string;
    },
  ) {
    return runBatchRepository.findMany(projectId, filters);
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

      const testRunData: Prisma.TestRunUncheckedCreateInput = {
        testCaseId: testCase.id,
        runBatchId: batchId,
        status: result.status as TestStatus,
        durationMs: result.durationMs,
        errorMessage: result.errorMessage,
        traceUrl: result.traceUrl,
      } as Prisma.TestRunUncheckedCreateInput;

      await testRunService.create({
        ...testRunData,
      });
    }

    return {
      uploaded: results.length,
    };
  },
};
