import {
  insightsRepository,
  type TimeWindow,
} from "../repositories/insights.repository";
import { metricsRepository } from "../repositories/metrics.repository";
import type { SummaryMetrics } from "@assertive/shared";

export const metricsService = {
  async getSummary(projectId: string, window?: TimeWindow) {
    const [summary, metrics] = await Promise.all([
      insightsRepository.getSummary(projectId, window),
      metricsRepository.getMetrics(projectId),
    ]);

    const summaryMetrics: SummaryMetrics = {
      totalTests: summary.totalTests,
      totalRuns: summary.totalRuns,
      passedRuns: summary.passedRuns,
      failedRuns: summary.failedRuns,
      staleRuns: summary.staleRuns,
      passRate:
        summary.totalRuns === 0
          ? 0
          : Number(((summary.passedRuns / summary.totalRuns) * 100).toFixed(2)),
    };

    return {
      summary: summaryMetrics,
      flakyTests: metrics.flakyTests,
      testTypeBreakdown: metrics.testTypeBreakdown,
      priorityBreakdown: metrics.priorityBreakdown,
    };
  },

  async getTrend(projectId: string, days = 30) {
    return metricsRepository.getTrend(projectId, days);
  },
};
