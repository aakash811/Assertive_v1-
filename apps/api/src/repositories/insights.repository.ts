import { prisma } from "../lib/prisma";

export const insightsRepository = {
  async getSummary(projectId: string) {
    const [totalTests, totalRuns, passedRuns, failedRuns, staleRuns] =
      await Promise.all([
        prisma.testCase.count({
          where: { projectId },
        }),

        prisma.testRun.count({
          where: {
            testCase: {
              projectId,
            },
          },
        }),

        prisma.testRun.count({
          where: {
            status: "PASSED",
            testCase: {
              projectId,
            },
          },
        }),

        prisma.testRun.count({
          where: {
            status: "FAILED",
            testCase: {
              projectId,
            },
          },
        }),

        prisma.testRun.count({
          where: {
            status: "STALE",
            testCase: {
              projectId,
            },
          },
        }),
      ]);

    return {
      totalTests,
      totalRuns,
      passedRuns,
      failedRuns,
      staleRuns,
    };
  },
};
