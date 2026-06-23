import { testCaseRepository } from "../repositories/test-case.repository";
import type { TestStatus } from "@prisma/client";

export const testCaseService = {
  create(
    projectId: string,
    data: {
      uniqueId: string;
      title: string;
      description?: string;
    },
  ) {
    return testCaseRepository.create({
      ...data,
      projectId,
    });
  },

  list(
    projectId: string,
    filters: {
      page: number;
      limit: number;
      q?: string;
      status?: TestStatus;
      owner?: string;
      tag?: string;
      flaky?: boolean;
    },
  ) {
    return testCaseRepository.findMany(projectId, filters);
  },

  get(id: string, projectId: string) {
    return testCaseRepository.findById(id, projectId);
  },

  update(
    id: string,
    data: {
      title?: string;
      description?: string;
    },
    projectId: string,
  ) {
    return testCaseRepository.update(id, data, projectId);
  },

  delete(id: string, projectId: string) {
    return testCaseRepository.delete(id, projectId);
  },

  findByUniqueId(uniqueId: string, projectId: string) {
    return testCaseRepository.findByUniqueId(uniqueId, projectId);
  },
};
