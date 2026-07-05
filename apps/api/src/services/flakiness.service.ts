import { testCaseRepository } from "../repositories/test-case.repository";
import { testRunRepository } from "../repositories/test-run.repository";

export const flakinessService = {
  async recalculate(testCaseId: string) {
    const runs =
      await testRunRepository.findRecentByTestCase(testCaseId);

    if (runs.length < 2) {
      return;
    }

    let transitions = 0;

    for (let i = 1; i < runs.length; i++) {
      if (runs[i].status !== runs[i - 1].status) {
        transitions++;
      }
    }

    const score = transitions / (runs.length - 1);

    await testCaseRepository.updateFlakiness(
      testCaseId,
      score,
    );
  },
};