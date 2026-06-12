import { prisma } from "../lib/prisma";

export const metricsService = {
  async summary(projectId: string) {
    const [totalTests, passedRuns, failedRuns, flakyTests, runBatches] =
      await Promise.all([
        prisma.testCase.count({
          where: { projectId },
        }),

        prisma.testRun.count({
          where: {
            testCase: {
              projectId,
            },
            status: "PASSED",
          },
        }),

        prisma.testRun.count({
          where: {
            testCase: {
              projectId,
            },
            status: "FAILED",
          },
        }),

        prisma.testCase.count({
          where: {
            projectId,
            isFlaky: true,
          },
        }),

        prisma.runBatch.count({
          where: {
            projectId,
          },
        }),
      ]);

    return {
      totalTests,
      passedRuns,
      failedRuns,
      flakyTests,
      runBatches,

      passRate:
        passedRuns + failedRuns === 0
          ? 0
          : Number(((passedRuns / (passedRuns + failedRuns)) * 100).toFixed(2)),
    };
  },
};
