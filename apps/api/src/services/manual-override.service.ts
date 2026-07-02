import { Prisma, TestStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const manualOverrideService = {
  async overrideStatus(
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

      if (!existing) {
        throw new Error("Test case not found");
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

      await tx.testCaseHistory.create({
        data: {
          testCaseId,
          action: "STATUS_OVERRIDE",
          comment,
          changes: {
            status: {
              from: previousStatus,
              to: status,
            },
          },
        },
      });

      return {
        success: true,
        testCase,
      };
    });
  },
};
