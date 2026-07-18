import { Prisma, TestStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const runBatchRepository = {
  create(data: Prisma.RunBatchUncheckedCreateInput) {
    return prisma.runBatch.create({
      data,
    });
  },

  async findMany(
    projectId: string,
    filters: {
      page: number;
      limit: number;
      q?: string;
      environment?: string;
      triggeredBy?: string;
    },
  ) {
    const { page, limit, q, environment, triggeredBy } = filters;
    const skip = (page - 1) * limit;
    const where: Prisma.RunBatchWhereInput = {
      projectId,
    };
    if (q) {
      where.OR = [
        {
          branch: {
            contains: q,
            mode: "insensitive",
          },
        },

        {
          commitSha: {
            contains: q,
            mode: "insensitive",
          },
        },
      ];
    }
    if (environment) {
      where.environment = {
        equals: environment,
        mode: "insensitive",
      };
    }
    if (triggeredBy) {
      where.triggeredBy = {
        equals: triggeredBy,
        mode: "insensitive",
      };
    }
    const [items, total] = await Promise.all([
      prisma.runBatch.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.runBatch.count({
        where,
      }),
    ]);

    return {
      items,
      total,
    };
  },

  findById(id: string, projectId: string) {
    return prisma.runBatch.findUnique({
      where: {
        id,
      },
      include: {
        runs: {
          include: {
            testCase: {
              select: {
                id: true,

                title: true,

                externalId: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    }).then((batch) => {
      if (!batch || batch.projectId !== projectId) {
        return null;
      }

      return batch;
    });
  },

  findUploadState(
    id: string,
    projectId: string,
  ) {
    return prisma.runBatch.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        uploadCompleted: true,
        projectId: true,
      },
    }).then((batch) => {
      if (!batch || batch.projectId !== projectId) {
        return null;
      }

      return batch;
    });
  },

  updateCounters(
    id: string,
    counts: {
      total: number;
      passed: number;
      failed: number;
      skipped: number;
    },
  ) {
    return prisma.runBatch.update({
      where: { id },
      data: {
        totalCount: { increment: counts.total },
        passedCount: { increment: counts.passed },
        failedCount: { increment: counts.failed },
        skippedCount: { increment: counts.skipped },
      },
    });
  },

  markUploaded(id: string) {
    return prisma.runBatch.update({
      where: {
        id,
      },
      data: {
        uploadCompleted: true,
        uploadedAt: new Date(),
      },
    });
  },
  
  incrementCounters(
    id: string,
    status: TestStatus,
  ) {
    const data: Prisma.RunBatchUpdateInput = {
      totalCount: {
        increment: 1,
      },
    };

    switch (status) {
      case "PASSED":
        data.passedCount = {
          increment: 1,
        };
        break;

      case "FAILED":
        data.failedCount = {
          increment: 1,
        };
        break;

      case "SKIPPED":
        data.skippedCount = {
          increment: 1,
        };
    }

    return prisma.runBatch.update({
      where: { id },
      data,
    });
  },
};
