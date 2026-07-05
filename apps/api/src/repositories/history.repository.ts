import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HistoryAction } from "@assertive/shared";

export const historyRepository = {
  create(data: {
    testCaseId: string;
    action: HistoryAction;
    changes?: Prisma.InputJsonValue;
    comment?: string;
    changedBy?: string;
  }) {
    return prisma.testCaseHistory.create({
      data,
    });
  },

  createMany(
    data: {
      testCaseId: string;
      action: HistoryAction;
      changes?: Prisma.InputJsonValue;
      comment?: string;
      changedBy?: string;
    }[],
  ) {
    return prisma.testCaseHistory.createMany({
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
