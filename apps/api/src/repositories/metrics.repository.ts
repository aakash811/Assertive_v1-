import { prisma } from "../lib/prisma";

export const metricsRepository = {
  async getSummary(projectId: string) {
    const [
      totalTests,
      totalRuns,
      passedRuns,
      failedRuns,
      staleRuns,
      flakyTests,
    ] = await Promise.all([
      prisma.testCase.count({
        where: {
          projectId,
        },
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
      prisma.testCase.count({
        where: {
          projectId,
          isFlaky: true,
        },
      }),
    ]);

    return {
      totalTests,
      totalRuns,
      passedRuns,
      failedRuns,
      staleRuns,
      flakyTests,
    };
  },
};
