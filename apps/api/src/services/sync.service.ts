import { prisma } from "../lib/prisma";

export const syncService = {
  async sync(
    projectId: string,
    testCases: {
      uniqueId: string;
      title: string;
    }[],
  ) {
    const existing = await prisma.testCase.findMany({
      where: {
        projectId,
      },
    });

    const incomingIds = new Set(testCases.map((t) => t.uniqueId));

    for (const test of testCases) {
      await prisma.testCase.upsert({
        where: {
          uniqueId: test.uniqueId,
        },

        create: {
          uniqueId: test.uniqueId,
          title: test.title,
          projectId,
        },

        update: {
          title: test.title,
          syncState: "SYNCED",
        },
      });
    }

    for (const test of existing) {
      if (!incomingIds.has(test.uniqueId)) {
        await prisma.testCase.update({
          where: {
            id: test.id,
          },
          data: {
            syncState: "STALE",
          },
        });
      }
    }

    return {
      synced: testCases.length,
      stale: existing.filter((t) => !incomingIds.has(t.uniqueId)).length,
    };
  },
};
