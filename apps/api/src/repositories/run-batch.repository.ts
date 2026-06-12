import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const runBatchRepository = {
  create(data: Prisma.RunBatchUncheckedCreateInput) {
    return prisma.runBatch.create({
      data,
    });
  },

  async findMany(projectId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.runBatch.findMany({
        where: {
          projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.runBatch.count({
        where: {
          projectId,
        },
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
    });
  },
};
