import { prisma } from "../lib/prisma";

export const testSuiteRepository = {
  create(data: {
    name: string;
    projectId: string;
    parentId?: string;
  }) {
    return prisma.testSuite.create({
      data,
    });
  },

  findMany(projectId: string) {
    return prisma.testSuite.findMany({
      where: {
        projectId,
      },
      include: {
        children: true,
      },
    });
  },

  findByProject(projectId: string) {
    return prisma.testSuite.findMany({
      where: {
        projectId,
      },
    });
  },

  assignTestCase(
    projectId: string,
    suiteId: string,
    testCaseId: string,
  ) {
    return prisma.testCase.updateMany({
      where: {
        id: testCaseId,
        projectId,
      },
      data: {
        suiteId,
      },
    });
  },

  update(
    id: string,
    projectId: string,
    data: {
      name?: string;
      parentId?: string | null;
    },
  ) {
    return prisma.testSuite.updateMany({
      where: {
        id,
        projectId,
      },
      data,
    });
  },

  delete(id: string, projectId: string) {
    return prisma.testSuite.deleteMany({
      where: {
        id,
        projectId,
      },
    });
  },

  async findOrCreate(
    projectId: string,
    name?: string,
  ) {
    if (!name) {
      return undefined;
    }

    let suite = await prisma.testSuite.findFirst({
      where: {
        projectId,
        name,
      },
    });

    if (!suite) {
      suite = await prisma.testSuite.create({
        data: {
          projectId,
          name,
        },
      });
    }

    return suite;
  },
};