import { prisma } from "../lib/prisma";

export const cleanupService = {
  async run() {
    const runs = await prisma.testRun.deleteMany({
      where: {},
    });

    const history = await prisma.testCaseHistory.deleteMany({
      where: {},
    });

    return {
      runs: runs.count,
      history: history.count,
      traces: 0,
    };
  },
};
