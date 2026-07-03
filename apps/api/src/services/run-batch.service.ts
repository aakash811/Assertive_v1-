import { Prisma } from "@prisma/client";
import { runBatchRepository } from "../repositories/run-batch.repository";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";
import {
  BatchUploadResult,
  CreateRunBatchDto,
} from "../validators/run-batch.validator";
import { testRunService } from "./test-run.service";
import { TestStatus } from "@prisma/client";
import { testCaseRepository } from "../repositories/test-case.repository";

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
    let uploaded = 0;
    for (const result of results) {
      // Reporter only uploads execution data.
      // Test inventory must already exist via Sync.
      const testCase = await testCaseRepository.findByExternalId(
        result.externalId, 
        projectId 
      );

      if (!testCase) {
        throw new AppError(
          ERROR_CODES.TEST_CASE_NOT_FOUND,
          `Unknown test '${result.externalId}'. Run 'assertive sync' first.`,
          404,
        );
      }

      const testRunData = {
        testCaseId: testCase.id,
        runBatchId: batchId,
        status: result.status as TestStatus,
        durationMs: result.durationMs,
        errorMessage: result.errorMessage,
        traceUrl: result.traceUrl,
      };

      await testRunService.create({
        ...testRunData,
      });
      uploaded++;
    }
    return {
      uploaded,
    };
  },
};
