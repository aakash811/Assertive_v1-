import { TestStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { historyService } from "./history.service";

export const manualOverrideService = {
  async overrideStatus(testCaseId: string, status: TestStatus) {
    const testCase = await prisma.testCase.update({
      where: {
        id: testCaseId,
      },
      data: {
        lastStatus: status,
        isManualOverride: true,
      },
    });

    await historyService.create({
      testCaseId,

      action: "MANUAL_OVERRIDE",

      changes: {
        status,
      },
    });

    return testCase;
  },
};
