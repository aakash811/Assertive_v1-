import { getCached, setCached } from "../lib/metrics-cache";
import { analyticsRepository } from "../repositories/analytics.repository";
import {
  insightsRepository,
  type TimeWindow,
} from "../repositories/insights.repository";
import type { SummaryMetrics } from "@assertive/shared";

type AnalyticsSummaryResponse = {
  summary: SummaryMetrics;
};

export const analyticsService = {
  async getSummary(
    projectId: string,
    window?: TimeWindow,
  ): Promise<AnalyticsSummaryResponse> {
    const cacheKey = `analytics:${projectId}:${JSON.stringify(window ?? {})}`;

    const cached = getCached<AnalyticsSummaryResponse>(cacheKey);

    if (cached) {
      return cached;
    }

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

    const result = {
      summary: summaryMetrics,
    };

    setCached(cacheKey, result);

    return result;
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
