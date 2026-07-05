import { historyRepository } from "../repositories/history.repository";
import { testRunRepository } from "../repositories/test-run.repository";

export const cleanupService = {
  async run() {
    const runs = await testRunRepository.deleteAll();

    const history = await historyRepository.deleteAll();

    return {
      runs: runs.count,
      history: history.count,
      traces: 0,
    };
  },
};