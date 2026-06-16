import { historyRepository } from "../repositories/history.repository";
import { prisma } from "../lib/prisma";

export const historyService = {
  create: historyRepository.create,

  list(testCaseId: string, page: number, limit: number) {
    return historyRepository.list(testCaseId, page, limit);
  },

  async listByUniqueId(
    projectId: string,
    uniqueId: string,
    page: number,
    limit: number,
  ) {
    const testCase = await prisma.testCase.findFirst({
      where: {
        projectId,
        uniqueId,
      },
    });

    if (!testCase) {
      throw new Error("Test case not found");
    }

    return historyRepository.list(testCase.id, page, limit);
  },
};
