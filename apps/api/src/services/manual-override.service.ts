import { Prisma, TestStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { historyService } from "./history.service";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

export const manualOverrideService = {
  async overrideStatus(
    projectId: string,
    testCaseId: string,
    status: TestStatus,
    comment: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.testCase.findUnique({
        where: {
          id: testCaseId,
        },
      });

      if (!existing || existing.projectId !== projectId) {
        throw new AppError(
          ERROR_CODES.TEST_CASE_NOT_FOUND,
          "Test case not found",
          404,
        );
      }

      const previousStatus = existing.lastStatus;

      const testCase = await tx.testCase.update({
        where: {
          id: testCaseId,
        },
        data: {
          lastStatus: status,
          isManualOverride: true,
          overrideComment: comment,
        },
      });

      const runBatch = await tx.runBatch.create({
        data: {
          projectId: existing.projectId,
          triggeredBy: "manual",
          environment: "manual",
        },
      });

      await tx.testRun.create({
        data: {
          testCaseId,
          runBatchId: runBatch.id,
          status,
          isManualOverride: true,
        },
      });

      const batchUpdate: Prisma.RunBatchUpdateInput = {
        totalCount: {
          increment: 1,
        },
      };

      switch (status) {
        case "PASSED":
          batchUpdate.passedCount = {
            increment: 1,
          };
          break;

        case "FAILED":
          batchUpdate.failedCount = {
            increment: 1,
          };
          break;

        case "SKIPPED":
          batchUpdate.skippedCount = {
            increment: 1,
          };
          break;
      }

      await tx.runBatch.update({
        where: {
          id: runBatch.id,
        },
        data: batchUpdate,
      });

      await historyService.manualOverride(
        testCaseId,
        comment,
        {
          status: {
            from: previousStatus,
            to: status,
          },
        },
      );

      return {
        success: true,
        testCase,
      };
    });
  },
};
