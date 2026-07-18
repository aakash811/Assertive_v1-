import { CleanupEngine } from "../lib/cleanup/cleanup-engine";
import type { CleanupPolicy } from "../lib/cleanup/cleanup-policy";
import { cleanupExpiredTraces } from "../lib/storage/trace-cleanup";
import { historyRepository } from "../repositories/history.repository";
import { testRunRepository } from "../repositories/test-run.repository";
import { getRetentionMs, loadRetentionPolicy } from "../lib/cleanup/retention";

const policies: CleanupPolicy[] = [
  {
    name: "runs",
    enabled: true,

    async execute() {
      const retention = getRetentionMs(loadRetentionPolicy().runs);
      const cutoff = new Date(Date.now() - retention);
      const result = await testRunRepository.deleteOlderThan(cutoff);
      return result.count;
    },
  },

  {
    name: "history",
    enabled: true,

    async execute() {
      const retention = getRetentionMs(loadRetentionPolicy().history);
      const cutoff = new Date(Date.now() - retention);
      const result = await historyRepository.deleteOlderThan(cutoff);
      return result.count;
    },
  },

  {
    name: "traces",
    enabled: true,

    execute() {
      return cleanupExpiredTraces();
    },
  },
];

export const cleanupService = {
  async run() {
    const engine = new CleanupEngine(policies);

    const result = await engine.run();

    return {
      runs: result.runs ?? 0,
      history: result.history ?? 0,
      traces: result.traces ?? 0,
    };
  },
};
