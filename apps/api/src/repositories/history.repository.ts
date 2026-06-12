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

  list(testCaseId: string) {
    return prisma.testCaseHistory.findMany({
      where: {
        testCaseId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};
