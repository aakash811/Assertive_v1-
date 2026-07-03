import { Prisma } from "@prisma/client";
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
    return prisma.runBatch.findFirst({
      where: {
        id,
        projectId,
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
    });
  },
};
