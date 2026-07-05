import { prisma } from "../lib/prisma";

export const testSuiteRepository = {
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