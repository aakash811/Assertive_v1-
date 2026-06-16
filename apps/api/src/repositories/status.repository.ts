import { prisma } from "../lib/prisma";

export const statusRepository = {
  async get(projectId: string) {
    const total = await prisma.testCase.count({
      where: {
        projectId,
      },
    });

    const synced = await prisma.testCase.count({
      where: {
        projectId,
        syncState: "SYNCED",
      },
    });

    const stale = await prisma.testCase.count({
      where: {
        projectId,
        syncState: "STALE",
      },
    });

    return {
      total,
      synced,
      stale,
    };
  },
};
