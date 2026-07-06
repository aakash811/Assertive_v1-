import { analyticsRepository } from "../repositories/analytics.repository";
import {
  insightsRepository,
  type TimeWindow,
} from "../repositories/insights.repository";
import type { SummaryMetrics } from "@assertive/shared";

export const analyticsService = {
  async getSummary(projectId: string, window?: TimeWindow) {
    const summary = await insightsRepository.getSummary(projectId, window);

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
      failureRate:
        summary.totalRuns === 0
          ? 0
          : Number(((summary.failedRuns / summary.totalRuns) * 100).toFixed(2)),
    };

    return {
      summary: summaryMetrics,
    };
  },

  getMostFailingTests(projectId: string) {
    return analyticsRepository.getMostFailingTests(projectId);
  },

  getSlowestTests(projectId: string) {
    return analyticsRepository.getSlowestTests(projectId);
  },

  getFlakyTests(projectId: string) {
    return analyticsRepository.getFlakyTests(projectId);
  },

  getStatusDistribution(projectId: string) {
    return analyticsRepository.getStatusDistribution(projectId);
  },

  getRecentFailures(projectId: string) {
    return analyticsRepository.getRecentFailures(projectId);
  },
};
