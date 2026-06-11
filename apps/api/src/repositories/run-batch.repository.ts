import { prisma } from "../lib/prisma";

export const runBatchRepository = {
  create(data: any) {
    return prisma.runBatch.create({
      data,
    });
  },

  findMany(projectId: string) {
    return prisma.runBatch.findMany({
      where: {
        projectId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
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
