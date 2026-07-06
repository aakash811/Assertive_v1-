import { prisma } from "../lib/prisma";

export const metricsRepository = {
  async getMetrics(projectId: string) {
    const [flakyTests, testTypeBreakdown, priorityBreakdown, recentBatches] =
      await Promise.all([
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
      flakyTests,
      testTypeBreakdown,
      priorityBreakdown,
      recentBatches,
    };
  },

  async getTrend(projectId: string, days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const batches = await prisma.runBatch.findMany({
      where: {
        projectId,
        createdAt: {
          gte: from,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        createdAt: true,
        totalCount: true,
        passedCount: true,
      },
    });

    return batches.map((batch) => ({
      createdAt: batch.createdAt,
      passRate:
        batch.totalCount === 0
          ? 0
          : Number(((batch.passedCount / batch.totalCount) * 100).toFixed(2)),
    }));
  },
};
