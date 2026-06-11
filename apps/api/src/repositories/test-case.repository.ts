import { prisma } from "@assertive/database";

export const testCaseRepository = {
  create(data: {
    uniqueId: string;
    title: string;
    description?: string;
    projectId: string;
  }) {
    return prisma.testCase.create({
      data,
    });
  },

  findMany(projectId: string) {
    return prisma.testCase.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  findById(id: string, projectId: string) {
    return prisma.testCase.findFirst({
      where: {
        id,
        projectId,
      },
    });
  },

  update(
    id: string,
    data: {
      title?: string;
      description?: string;
    },
    projectId: string,
  ) {
    return prisma.testCase.update({
      where: {
        id,
        projectId,
      },
      data,
    });
  },

  delete(id: string, projectId: string) {
    return prisma.testCase.delete({
      where: {
        id,
        projectId,
      },
    });
  },
};
