import { prisma } from "../lib/prisma";

export const testCaseTagRepository = {
  async replaceTags(
    testCaseId: string,
    tagIds: string[],
  ) {
    await prisma.testCaseTag.deleteMany({
      where: {
        testCaseId,
      },
    });

    if (!tagIds.length) {
      return;
    }

    await prisma.testCaseTag.createMany({
      data: tagIds.map((tagId) => ({
        testCaseId,
        tagId,
      })),
    });
  },
};