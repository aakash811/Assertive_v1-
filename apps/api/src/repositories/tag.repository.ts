import { prisma } from "../lib/prisma";

export const tagRepository = {
  create(data: {
    projectId: string;
    name: string;
    color?: string;
  }) {
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

  findByProject(projectId: string) {
    return prisma.tag.findMany({
      where: {
        projectId,
      },
    });
  },

  assign(projectId: string, testCaseId: string, tagId: string) {
    return prisma.testCaseTag.create({
      data: {
        testCaseId,
        tagId,
      },
    });
  },

  remove(projectId: string, testCaseId: string, tagId: string) {
    return prisma.testCaseTag.delete({
      where: {
        testCaseId_tagId: {
          testCaseId,
          tagId,
        },
      },
    });
  },

  delete(id: string, projectId: string) {
    return prisma.tag.delete({
      where: {
        id,
      },
    });
  },

  async findOrCreate(
    projectId: string,
    name: string,
  ) {
    let tag = await prisma.tag.findUnique({
      where: {
        projectId_name: {
          projectId,
          name,
        },
      },
    });

    if (!tag) {
      tag = await prisma.tag.create({
        data: {
          projectId,
          name,
        },
      });
    }

    return tag;
  },
};