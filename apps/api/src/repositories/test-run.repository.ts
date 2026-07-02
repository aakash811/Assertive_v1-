import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const testRunRepository = {
  create(data: Prisma.TestRunUncheckedCreateInput) {
    return prisma.testRun.create({
      data,
    });
  },

  async findMany(
    projectId: string,
    page: number,
    limit: number,
    testCaseId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.TestRunWhereInput = {
      testCase: {
        projectId,
      },
    };

    if (testCaseId) {
      where.testCaseId = testCaseId;
    }
    const [items, total] = await Promise.all([
      prisma.testRun.findMany({
        where,
        include: {
          testCase: true,
        },

        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.testRun.count({
        where,
      }),
    ]);

    return {
      items,
      total,
    };
  },

  findById(id: string, projectId: string) {
    return prisma.testRun.findFirst({
      where: {
        id,

        testCase: {
          projectId,
        },
      },
    });
  },
};
