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
      testTypeBreakdown,
      priorityBreakdown,
      recentBatches,
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
      prisma.testCase.groupBy({
        by: ["testType"],
        where: {
          projectId,
        },
        _count: true,
      }),
      prisma.testCase.groupBy({
        by: ["priority"],
        where: {
          projectId,
        },
        _count: true,
      }),
      prisma.runBatch.findMany({
        where: {
          projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          totalCount: true,
          passedCount: true,
          failedCount: true,
          skippedCount: true,
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
      testTypeBreakdown,
      priorityBreakdown,
      recentBatches,
    };
  },
};
