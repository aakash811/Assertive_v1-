import { prisma } from "../lib/prisma";

export const tagRepository = {
  create(data: { projectId: string; name: string; color?: string }) {
    return prisma.tag.create({
      data,
    });
  },

  findMany(projectId: string) {
    return prisma.tag.findMany({
      where: {
        projectId,
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  assign(testCaseId: string, tagId: string) {
    return prisma.testCaseTag.create({
      data: {
        testCaseId,
        tagId,
      },
    });
  },

  remove(testCaseId: string, tagId: string) {
    return prisma.testCaseTag.delete({
      where: {
        testCaseId_tagId: {
          testCaseId,
          tagId,
        },
      },
    });
  },

  delete(id: string) {
    return prisma.tag.delete({
      where: {
        id,
      },
    });
  },
};
