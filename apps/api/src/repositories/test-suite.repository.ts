import { prisma } from "../lib/prisma";

export const testSuiteRepository = {
  create(data: { name: string; projectId: string; parentId?: string }) {
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

  assignTestCase(suiteId: string, testCaseId: string) {
    return prisma.testCase.update({
      where: {
        id: testCaseId,
      },
      data: {
        suiteId,
      },
    });
  },
};
