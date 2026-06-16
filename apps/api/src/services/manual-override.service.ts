import { TestStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { historyService } from "./history.service";

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

      await historyService.create({
        testCaseId,
        action: "MANUAL_OVERRIDE",
        comment,
        changes: {
          status: {
            from: previousStatus,
            to: status,
          },
        },
      });

      return { success: true, testCase };
    });
  },
};
