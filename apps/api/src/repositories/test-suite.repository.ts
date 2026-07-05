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

  assignTestCase(
    suiteId: string,
    testCaseId: string,
  ) {
    return prisma.testCase.update({
      where: {
        id: testCaseId,
      },
      data: {
        suiteId,
      },
    });
  },

  update(
    id: string,
    data: {
      name?: string;
      parentId?: string | null;
    },
  ) {
    return prisma.testSuite.update({
      where: {
        id,
      },
      data,
    });
  },

  delete(id: string) {
    return prisma.testSuite.delete({
      where: {
        id,
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