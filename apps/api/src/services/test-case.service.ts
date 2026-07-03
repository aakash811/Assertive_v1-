import { testCaseRepository } from "../repositories/test-case.repository";
import type { TestStatus } from "@prisma/client";

export const testCaseService = {
  async create(
    projectId: string,
    data: {
      externalId: string;
      title: string;
      description?: string;
      owner?: string;
      priority?: string;
      testType?: string;
      suiteId?: string;
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
      suite?: string;
      syncState?: "SYNCED" | "STALE";
      testType?: string;
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

  findByExternalId(externalId: string, projectId: string) {
    return testCaseRepository.findByExternalId(externalId, projectId);
  },
};
