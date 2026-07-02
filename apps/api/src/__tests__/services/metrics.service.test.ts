import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/metrics.repository", () => ({
  metricsRepository: {
    getSummary: vi.fn(),
  },
}));

import { metricsRepository } from "../../repositories/metrics.repository";
import { metricsService } from "../../services/metrics.service";

describe("metricsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates pass rate", async () => {
    vi.mocked(metricsRepository.getSummary).mockResolvedValue({
      totalTests: 5,
      totalRuns: 10,
      passedRuns: 8,
      failedRuns: 2,
      staleRuns: 0,
      flakyTests: 1,
      recentBatches: [],
    } as never);

    const result = await metricsService.getSummary("project-1");

    expect(result.passRate).toBe(80);
    expect(result.trend).toEqual([]);
    expect(metricsRepository.getSummary).toHaveBeenCalledWith("project-1");
  });

  it("returns zero pass rate when no runs exist", async () => {
    vi.mocked(metricsRepository.getSummary).mockResolvedValue({
      totalTests: 0,
      totalRuns: 0,
      passedRuns: 0,
      failedRuns: 0,
      staleRuns: 0,
      flakyTests: 0,
      recentBatches: [],
    } as never);

    const result = await metricsService.getSummary("project-1");

    expect(result.passRate).toBe(0);
    expect(result.trend).toEqual([]);
  });
});
