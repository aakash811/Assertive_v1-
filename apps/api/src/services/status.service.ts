import { statusRepository } from "../repositories/status.repository";
import { getCached, setCached } from "../lib/metrics-cache";

export const statusService = {
  async get(projectId: string) {
    const cacheKey = `status:${projectId}`;

    const cached = getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await statusRepository.get(projectId);

    setCached(cacheKey, result);

    return result;
  },
};
