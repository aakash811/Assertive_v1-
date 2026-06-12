import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const historyRepository = {
  create(data: {
    testCaseId: string;
    action: string;
    changes?: Prisma.InputJsonValue;
    comment?: string;
    changedBy?: string;
  }) {
    return prisma.testCaseHistory.create({
      data,
    });
  },

  async list(testCaseId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.testCaseHistory.findMany({
        where: {
          testCaseId,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.testCaseHistory.count({
        where: {
          testCaseId,
        },
      }),
    ]);

    return {
      items,
      total,
    };
  },
};
