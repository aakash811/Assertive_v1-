import { TestStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";
import { BatchUploadResult } from "../validators/run-batch.validator";
import { testCaseRepository } from "../repositories/test-case.repository";
import { testRunService } from "./test-run.service";

export const executionEngineService = {
  async execute(
    batchId: string,
    projectId: string,
    results: BatchUploadResult[],
  ) {
    const ids = new Set<string>();

    for (const result of results) {
      if (ids.has(result.externalId)) {
        throw new AppError(
          ERROR_CODES.VALIDATION_ERROR,
          `Duplicate externalId '${result.externalId}' in upload.`,
          400,
        );
      }

      ids.add(result.externalId);
    }

    const testCases = await testCaseRepository.findByExternalIds(
      results.map((r) => r.externalId),
      projectId,
      true,
    );

    const testCaseMap = new Map(
      testCases.map((tc) => [tc.externalId, tc]),
    );

    for (const result of results) {
      const testCase = testCaseMap.get(result.externalId);

      if (!testCase) {
        throw new AppError(
          ERROR_CODES.TEST_CASE_NOT_FOUND,
          `Unknown test '${result.externalId}'. Run 'assertive sync' first.`,
          404,
        );
      }

      if (testCase.lifecycle === "ARCHIVED") {
        throw new AppError(
          ERROR_CODES.TEST_CASE_NOT_FOUND,
          `Test '${result.externalId}' is archived.`,
          400,
        );
      }
    }

    for (const result of results) {
      const testCase = testCaseMap.get(result.externalId)!;

      await testRunService.create({
        testCaseId: testCase.id,
        runBatchId: batchId,
        status: result.status as TestStatus,
        durationMs: result.durationMs,
        errorMessage: result.errorMessage,
        traceUrl: result.traceUrl,
      });
    }

    return results.length;
  },
};