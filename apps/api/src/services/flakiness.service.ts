import { prisma } from "../lib/prisma";

export const flakinessService = {
  async recalculate(testCaseId: string) {
    const runs = await prisma.testRun.findMany({
      where: {
        testCaseId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    if (runs.length < 2) {
      return;
    }

    let transitions = 0;

    for (let i = 1; i < runs.length; i++) {
      if (runs[i].status !== runs[i - 1].status) {
        transitions++;
      }
    }

    const score = transitions / (runs.length - 1);

    await prisma.testCase.update({
      where: {
        id: testCaseId,
      },
      data: {
        flakyScore: score,
        isFlaky: score >= 0.3,
      },
    });
  },
};
