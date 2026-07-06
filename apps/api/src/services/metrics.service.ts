import {
  insightsRepository,
  type TimeWindow,
} from "../repositories/insights.repository";
import { metricsRepository } from "../repositories/metrics.repository";
import type { SummaryMetrics } from "@assertive/shared";
import { getCached, setCached } from "../lib/metrics-cache";

type MetricsSummaryResponse = {
  summary: SummaryMetrics;
  flakyTests: number;
  testTypeBreakdown: Awaited<
    ReturnType<typeof metricsRepository.getMetrics>
  >["testTypeBreakdown"];
  priorityBreakdown: Awaited<
    ReturnType<typeof metricsRepository.getMetrics>
  >["priorityBreakdown"];
};

export const metricsService = {
  async getSummary(
    projectId: string,
    window?: TimeWindow,
  ): Promise<MetricsSummaryResponse> {
    const cacheKey = `metrics:${projectId}:${JSON.stringify(window ?? {})}`;

    const cached = getCached<MetricsSummaryResponse>(cacheKey);

    if (cached) {
      return cached;
    }

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

    const result = {
      summary: summaryMetrics,
      flakyTests: metrics.flakyTests,
      testTypeBreakdown: metrics.testTypeBreakdown,
      priorityBreakdown: metrics.priorityBreakdown,
    };

    setCached(cacheKey, result);

    return result;
  },

  async getTrend(projectId: string, days = 30) {
    return metricsRepository.getTrend(projectId, days);
  },
};
