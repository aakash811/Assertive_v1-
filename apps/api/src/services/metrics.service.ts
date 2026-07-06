import { insightsRepository } from "../repositories/insights.repository";
import { metricsRepository } from "../repositories/metrics.repository";

export const metricsService = {
  async getSummary(projectId: string) {
    const [summary, metrics] = await Promise.all([
      insightsRepository.getSummary(projectId),
      metricsRepository.getMetrics(projectId),
    ]);

    const trend = metrics.recentBatches.reverse().map((batch) => ({
      createdAt: batch.createdAt,
      passRate:
        batch.totalCount === 0
          ? 0
          : Number(((batch.passedCount / batch.totalCount) * 100).toFixed(2)),
    }));

    return {
      ...summary,
      ...metrics,

      passRate:
        summary.totalRuns === 0
          ? 0
          : Number(((summary.passedRuns / summary.totalRuns) * 100).toFixed(2)),

      trend,
    };
  },
};
