import { historyRepository } from "../repositories/history.repository";

export const historyService = {
  create: historyRepository.create,

  list(testCaseId: string) {
    return historyRepository.list(testCaseId);
  },
};
