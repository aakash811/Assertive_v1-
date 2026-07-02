import { testSuiteRepository } from "../repositories/test-suite.repository";

export const testSuiteService = {
  create: testSuiteRepository.create,

  list(projectId: string) {
    return testSuiteRepository.findMany(projectId);
  },

  assignTestCase(suiteId: string, testCaseId: string) {
    return testSuiteRepository.assignTestCase(suiteId, testCaseId);
  },

  update(id: string, data: { name?: string; parentId?: string | null }) {
    return testSuiteRepository.update(id, data);
  },

  delete(id: string) {
    return testSuiteRepository.delete(id);
  },
};
