import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/insights.repository", () => ({
  insightsRepository: {
    getSummary: vi.fn(),
  },
}));

vi.mock("../../repositories/metrics.repository", () => ({
  metricsRepository: {
    getMetrics: vi.fn(),
    getTrend: vi.fn(),
  },
}));

vi.mock("../../lib/metrics-cache", () => ({
  getCached: vi.fn(),
  setCached: vi.fn(),
}));

import { insightsRepository } from "../../repositories/insights.repository";
import { metricsRepository } from "../../repositories/metrics.repository";
import { getCached, setCached } from "../../lib/metrics-cache";
import { metricsService } from "../../services/metrics.service";

describe("metricsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Summary Calculation", async () => {
    vi.mocked(getCached).mockReturnValue(undefined);

    vi.mocked(insightsRepository.getSummary).mockResolvedValue({
      totalTests: 5,
      totalRuns: 10,
      passedRuns: 8,
      failedRuns: 2,
      staleRuns: 0,
    });

    vi.mocked(metricsRepository.getMetrics).mockResolvedValue({
      flakyTests: 1,
      testTypeBreakdown: [],
      priorityBreakdown: [],
      recentBatches: [],
    });

    const result = await metricsService.getSummary("project-1");

    expect(result.summary.passRate).toBe(80);
    expect(result.flakyTests).toBe(1);
    expect(setCached).toHaveBeenCalled();
  });

  it("caches hit", async () => {
    vi.mocked(getCached).mockReturnValue({
      summary: {
        totalTests: 1,
        totalRuns: 1,
        passedRuns: 1,
        failedRuns: 0,
        staleRuns: 0,
        passRate: 100,
      },
      flakyTests: 0,
      testTypeBreakdown: [],
      priorityBreakdown: [],
    });

    const result = await metricsService.getSummary("project-1");

    expect(result.summary.passRate).toBe(100);

    expect(insightsRepository.getSummary).not.toHaveBeenCalled();
    expect(metricsRepository.getMetrics).not.toHaveBeenCalled();
  });

  it("Trend Calculation", async () => {
    vi.mocked(metricsRepository.getTrend).mockResolvedValue([]);

    const result = await metricsService.getTrend("project-1");

    expect(metricsRepository.getTrend).toHaveBeenCalledWith("project-1", 30);

    expect(result).toEqual([]);
  });
});
