import { testCaseRepository } from "../repositories/test-case.repository";
import type { TestStatus } from "@prisma/client";
import { historyService } from "./history.service";

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
      lifecycle?: "ACTIVE" | "ARCHIVED";
      testType?: string;
    },
  ) {
    return testCaseRepository.findMany(projectId, filters);
  },

  get(id: string, projectId: string, includeArchived = false) {
    return testCaseRepository.findById(id, projectId, includeArchived);
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

  async archive(id: string, projectId: string) {
   const testCase = await testCaseRepository.archive(id, projectId);
   await historyService.archived(testCase.id);
   return testCase;
  },

  async restore(id: string, projectId: string) {
    const testCase = await testCaseRepository.restore(id, projectId);
    await historyService.restored(testCase.id);
    return testCase;
  },

  findByExternalId(externalId: string, projectId: string, includeArchived = false) {
    return testCaseRepository.findByExternalId(externalId, projectId, includeArchived);
  },
};
