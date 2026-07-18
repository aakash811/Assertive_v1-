import { testSuiteRepository } from "../repositories/test-suite.repository";

export const testSuiteService = {
  create: testSuiteRepository.create,

  list(projectId: string) {
    return testSuiteRepository.findMany(projectId);
  },

  assignTestCase(projectId: string, suiteId: string, testCaseId: string) {
    return testSuiteRepository.assignTestCase(projectId, suiteId, testCaseId);
  },

  update(id: string, projectId: string, data: { name?: string; parentId?: string | null }) {
    return testSuiteRepository.update(id, projectId, data);
  },

  delete(id: string, projectId: string) {
    return testSuiteRepository.delete(id, projectId);
  },
};
