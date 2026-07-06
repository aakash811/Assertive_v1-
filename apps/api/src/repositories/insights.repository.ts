import { prisma } from "../lib/prisma";

export type TimeWindow = {
  from?: Date;
  to?: Date;
};

export const insightsRepository = {
  async getSummary(projectId: string, window?: TimeWindow) {
    const runWhere = {
      testCase: {
        projectId,
      },
      ...(window?.from || window?.to
        ? {
            createdAt: {
              ...(window.from && { gte: window.from }),
              ...(window.to && { lte: window.to }),
            },
          }
        : {}),
    };

    const [totalTests, totalRuns, passedRuns, failedRuns, staleRuns] =
      await Promise.all([
        prisma.testCase.count({
          where: {
            projectId,
          },
        }),

        prisma.testRun.count({
          where: runWhere,
        }),

        prisma.testRun.count({
          where: {
            ...runWhere,
            status: "PASSED",
          },
        }),

        prisma.testRun.count({
          where: {
            ...runWhere,
            status: "FAILED",
          },
        }),

        prisma.testRun.count({
          where: {
            ...runWhere,
            status: "STALE",
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
