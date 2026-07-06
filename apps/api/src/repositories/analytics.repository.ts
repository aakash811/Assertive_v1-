import { prisma } from "../lib/prisma";

export const analyticsRepository = {
  async getMostFailingTests(projectId: string) {
    const grouped = await prisma.testRun.groupBy({
      by: ["testCaseId"],
      where: {
        status: "FAILED",
        testCase: {
          projectId,
        },
      },
      _count: {
        testCaseId: true,
      },
      orderBy: {
        _count: {
          testCaseId: "desc",
        },
      },
      take: 10,
    });

    const testCases = await prisma.testCase.findMany({
      where: {
        id: {
          in: grouped.map((g) => g.testCaseId),
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const titleMap = new Map(testCases.map((tc) => [tc.id, tc.title]));

    return grouped.map((group) => ({
      title: titleMap.get(group.testCaseId) ?? "Unknown",
      failures: group._count.testCaseId,
    }));
  },

  async getSlowestTests(projectId: string) {
    const grouped = await prisma.testRun.groupBy({
      by: ["testCaseId"],
      where: {
        testCase: {
          projectId,
        },
      },
      _avg: {
        durationMs: true,
      },
      orderBy: {
        _avg: {
          durationMs: "desc",
        },
      },
      take: 10,
    });

    const testCases = await prisma.testCase.findMany({
      where: {
        id: {
          in: grouped.map((g) => g.testCaseId),
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const titleMap = new Map(testCases.map((tc) => [tc.id, tc.title]));

    return grouped.map((group) => ({
      title: titleMap.get(group.testCaseId) ?? "Unknown",
      averageDuration: Math.round(group._avg.durationMs ?? 0),
    }));
  },

  async getFlakyTests(projectId: string) {
    const tests = await prisma.testCase.findMany({
      where: {
        projectId,
      },
      include: {
        runs: {
          orderBy: {
            createdAt: "desc",
          },

          take: 10,
        },
      },
    });

    return tests
      .map((test) => {
        let changes = 0;

        for (let i = 1; i < test.runs.length; i++) {
          if (test.runs[i].status !== test.runs[i - 1].status) {
            changes++;
          }
        }

        const score = test.runs.length === 0 ? 0 : changes / test.runs.length;

        return {
          id: test.id,
          title: test.title,
          flakyScore: Number(score.toFixed(2)),
        };
      })
      .filter((test) => test.flakyScore > 0)
      .sort((a, b) => b.flakyScore - a.flakyScore);
  },

  async getStatusDistribution(projectId: string) {
    const grouped = await prisma.testRun.groupBy({
      by: ["status"],
      where: {
        testCase: {
          projectId,
        },
      },
      _count: {
        status: true,
      },
    });

    const counts = {
      PASSED: 0,
      FAILED: 0,
      STALE: 0,
      SKIPPED: 0,
      UNKNOWN: 0,
    };

    for (const row of grouped) {
      counts[row.status] = row._count.status;
    }

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  },

  async getRecentFailures(projectId: string) {
    const runs = await prisma.testRun.findMany({
      where: {
        status: "FAILED",
        testCase: {
          projectId,
        },
      },

      include: {
        testCase: {
          select: {
            id: true,
            title: true,
          },
        },

        runBatch: {
          select: {
            id: true,
            branch: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return runs.map((run) => ({
      id: run.id,
      title: run.testCase.title,
      createdAt: run.createdAt,
      runBatchId: run.runBatchId,
      branch: run.runBatch?.branch,
    }));
  },
};
