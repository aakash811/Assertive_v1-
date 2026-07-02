import { testCaseRepository } from "../repositories/test-case.repository";
import type { TestStatus } from "@prisma/client";
import { generateUniqueId } from "../lib/generate-unique-id";

export const testCaseService = {
  async create(
    projectId: string,
    data: {
      title: string;
      description?: string;
      owner?: string;
      priority?: string;
      testType?: string;
      suiteId?: string;
    },
  ) {
    const uniqueId = await generateUniqueId(projectId);

    return testCaseRepository.create({
      ...data,
      projectId,
      uniqueId,
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

  findByUniqueId(uniqueId: string, projectId: string) {
    return testCaseRepository.findByUniqueId(uniqueId, projectId);
  },
};
