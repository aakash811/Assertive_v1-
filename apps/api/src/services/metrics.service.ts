import { metricsRepository } from "../repositories/metrics.repository";

export const metricsService = {
  async getSummary(projectId: string) {
    const summary = await metricsRepository.getSummary(projectId);
    const trend = summary.recentBatches.reverse().map((batch) => ({
      createdAt: batch.createdAt,

      passRate:
        batch.totalCount === 0
          ? 0
          : Number(((batch.passedCount / batch.totalCount) * 100).toFixed(2)),
    }));

    return {
      ...summary,
      passRate:
        summary.totalRuns === 0
          ? 0
          : Number(((summary.passedRuns / summary.totalRuns) * 100).toFixed(2)),
      trend,
    };
  },
};
