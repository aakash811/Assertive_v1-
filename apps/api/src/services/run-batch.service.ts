import { runBatchRepository } from "../repositories/run-batch.repository";

export const runBatchService = {
  create(projectId: string, data: any) {
    return runBatchRepository.create({
      ...data,
      projectId,
    });
  },

  list(projectId: string) {
    return runBatchRepository.findMany(projectId);
  },

  get(id: string, projectId: string) {
    return runBatchRepository.findById(id, projectId);
  },
};
