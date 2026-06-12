import { testSuiteRepository } from "../repositories/test-suite.repository";

export const testSuiteService = {
  create: testSuiteRepository.create,

  list(projectId: string) {
    return testSuiteRepository.findMany(projectId);
  },

  assignTestCase(suiteId: string, testCaseId: string) {
    return testSuiteRepository.assignTestCase(suiteId, testCaseId);
  },
};
