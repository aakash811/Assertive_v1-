import { analyticsRepository } from "../repositories/analytics.repository";
import { insightsRepository } from "../repositories/insights.repository";

export const analyticsService = {
  async getSummary(projectId: string) {
    const summary = await insightsRepository.getSummary(projectId);

    return {
      ...summary,

      passRate:
        summary.totalRuns === 0
          ? 0
          : Number(((summary.passedRuns / summary.totalRuns) * 100).toFixed(2)),

      failureRate:
        summary.totalRuns === 0
          ? 0
          : Number(((summary.failedRuns / summary.totalRuns) * 100).toFixed(2)),
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
