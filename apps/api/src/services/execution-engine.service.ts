import { TestStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";
import { BatchUploadResult } from "../validators/run-batch.validator";
import { testCaseRepository } from "../repositories/test-case.repository";
import { testRunRepository } from "../repositories/test-run.repository";
import { runBatchRepository } from "../repositories/run-batch.repository";
import { historyService } from "./history.service";
import { flakinessService } from "./flakiness.service";

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

    const testRuns = results.map((result) => {
      const testCase = testCaseMap.get(result.externalId)!;

      return {
        testCaseId: testCase.id,
        runBatchId: batchId,
        status: result.status as TestStatus,
        durationMs: result.durationMs,
        errorMessage: result.errorMessage,
        errorStack: result.errorStack,
        traceUrl: result.traceUrl,
        browser: result.browser,
        os: result.os,
        attemptNumber: result.attemptNumber ?? 1,
        retryOfId: result.retryOf,
      };
    });

    await testRunRepository.createMany(testRuns);

    const counts = {
      total: results.length,
      passed: 0,
      failed: 0,
      skipped: 0,
    };

    for (const result of results) {
      const testCase = testCaseMap.get(result.externalId)!;

      await testCaseRepository.updateExecutionState(
        testCase.id,
        result.status as TestStatus,
      );

      const existing = await testCaseRepository.findRawById(testCase.id);

      if (existing?.isManualOverride) {
        await historyService.manualOverrideCleared(testCase.id);
      }

      await historyService.statusChanged(testCase.id, {
        status: {
          from: existing?.lastStatus,
          to: result.status,
        },
      });

      await flakinessService.recalculate(testCase.id);

      switch (result.status) {
        case "PASSED":
          counts.passed++;
          break;
        case "FAILED":
          counts.failed++;
          break;
        case "SKIPPED":
          counts.skipped++;
          break;
      }
    }

    await runBatchRepository.updateCounters(batchId, counts);

    return results.length;
  },
};