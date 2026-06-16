import { statusRepository } from "../repositories/status.repository";

export const statusService = {
  async get(projectId: string) {
    return statusRepository.get(projectId);
  },
};
