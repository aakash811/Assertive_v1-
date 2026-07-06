import { prisma } from "../lib/prisma";

export const analyticsRepository = {
  async getMostFailingTests(projectId: string) {
    const runs = await prisma.testRun.findMany({
      where: {
        status: "FAILED",
        testCase: {
          projectId,
        },
      },

      include: {
        testCase: true,
      },
    });

    const map = new Map<string, { title: string; failures: number }>();

    for (const run of runs) {
      const current = map.get(run.testCaseId);
      map.set(run.testCaseId, {
        title: run.testCase.title,
        failures: (current?.failures ?? 0) + 1,
      });
    }

    return [...map.values()]
      .sort((a, b) => b.failures - a.failures)
      .slice(0, 10);
  },

  async getSlowestTests(projectId: string) {
    const runs = await prisma.testRun.findMany({
      where: {
        testCase: {
          projectId,
        },
      },

      include: {
        testCase: true,
      },
    });

    const stats = new Map<
      string,
      { title: string; total: number; count: number }
    >();

    for (const run of runs) {
      const current = stats.get(run.testCaseId);

      stats.set(run.testCaseId, {
        title: run.testCase.title,
        total: (current?.total ?? 0) + (run.durationMs ?? 0),
        count: (current?.count ?? 0) + 1,
      });
    }

    return [...stats.values()]
      .map((item) => ({
        title: item.title,
        averageDuration:
          item.count === 0 ? 0 : Math.round(item.total / item.count),
      }))
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 10);
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
