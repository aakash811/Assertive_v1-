import { metricsRepository } from "../repositories/metrics.repository";

export const metricsService = {
  async getSummary(projectId: string) {
    const summary = await metricsRepository.getSummary(projectId);

    return {
      ...summary,
      passRate:
        summary.totalRuns === 0
          ? 0
          : Number(((summary.passedRuns / summary.totalRuns) * 100).toFixed(2)),
    };
  },
};
