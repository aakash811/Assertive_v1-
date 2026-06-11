import { prisma } from "../lib/prisma";

export const testRunRepository = {
  create(data: any) {
    return prisma.testRun.create({
      data,
    });
  },

  findMany(projectId: string) {
    return prisma.testRun.findMany({
      where: {
        testCase: {
          projectId,
        },
      },

      include: {
        testCase: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
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
