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

  async findMany(projectId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.testCase.findMany({
        where: {
          projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.testCase.count({
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

  findByUniqueId(uniqueId: string, projectId: string) {
    return prisma.testCase.findFirst({
      where: {
        uniqueId,
        projectId,
      },
    });
  },
};
