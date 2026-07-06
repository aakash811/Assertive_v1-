import { prisma } from "../lib/prisma";

export const testCaseTagRepository = {
  findTagIds(testCaseId: string) {
    return prisma.testCaseTag.findMany({
      where: {
        testCaseId,
      },
      select: {
        tagId: true,
      },
    });
  },

  async syncTags(
    testCaseId: string,
    tagIds: string[],
  ) {
    const existing =
      await this.findTagIds(testCaseId);

    const existingIds = new Set(
      existing.map((t) => t.tagId),
    );

    const incomingIds = new Set(tagIds);

    const toAdd = tagIds.filter(
      (id) => !existingIds.has(id),
    );

    const toRemove = [...existingIds].filter(
      (id) => !incomingIds.has(id),
    );

    if (toRemove.length > 0) {
      await prisma.testCaseTag.deleteMany({
        where: {
          testCaseId,
          tagId: {
            in: toRemove,
          },
        },
      });
    }

    if (toAdd.length > 0) {
      await prisma.testCaseTag.createMany({
        data: toAdd.map((tagId) => ({
          testCaseId,
          tagId,
        })),
      });
    }
  },
};