import { historyRepository } from "../repositories/history.repository";

export const historyService = {
  create: historyRepository.create,

  list(testCaseId: string, page: number, limit: number) {
    return historyRepository.list(testCaseId, page, limit);
  },
};
