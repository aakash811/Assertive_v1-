import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/analytics.repository", () => ({
  analyticsRepository: {
    getMostFailingTests: vi.fn(),
    getSlowestTests: vi.fn(),
    getFlakyTests: vi.fn(),
    getStatusDistribution: vi.fn(),
    getRecentFailures: vi.fn(),
  },
}));

vi.mock("../../repositories/insights.repository", () => ({
  insightsRepository: {
    getSummary: vi.fn(),
  },
}));

vi.mock("../../lib/metrics-cache", () => ({
  getCached: vi.fn(),
  setCached: vi.fn(),
}));

import { analyticsRepository } from "../../repositories/analytics.repository";
import { insightsRepository } from "../../repositories/insights.repository";
import { getCached, setCached } from "../../lib/metrics-cache";
import { analyticsService } from "../../services/analytics.service";

describe("analyticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates analytics summary", async () => {
    vi.mocked(getCached).mockReturnValue(undefined);

    vi.mocked(insightsRepository.getSummary).mockResolvedValue({
      totalTests: 10,
      totalRuns: 20,
      passedRuns: 15,
      failedRuns: 5,
      staleRuns: 0,
    });

    const result = await analyticsService.getSummary("project-1");

    expect(result.summary.passRate).toBe(75);
    expect(result.summary.failureRate).toBe(25);

    expect(setCached).toHaveBeenCalled();
  });

  it("returns cached analytics summary", async () => {
    const cached = {
      summary: {
        totalTests: 10,
        totalRuns: 20,
        passedRuns: 15,
        failedRuns: 5,
        staleRuns: 0,
        passRate: 75,
        failureRate: 25,
      },
    };

    vi.mocked(getCached).mockReturnValue(cached);

    const result = await analyticsService.getSummary("project-1");

    expect(insightsRepository.getSummary).not.toHaveBeenCalled();
    expect(result).toEqual(cached);
  });

  it("delegates getMostFailingTests", () => {
    analyticsService.getMostFailingTests("project-1");

    expect(analyticsRepository.getMostFailingTests).toHaveBeenCalledWith(
      "project-1",
    );
  });

  it("delegates getSlowestTests", () => {
    analyticsService.getSlowestTests("project-1");

    expect(analyticsRepository.getSlowestTests).toHaveBeenCalledWith(
      "project-1",
    );
  });

  it("delegates getFlakyTests", () => {
    analyticsService.getFlakyTests("project-1");

    expect(analyticsRepository.getFlakyTests).toHaveBeenCalledWith("project-1");
  });

  it("delegates getStatusDistribution", () => {
    analyticsService.getStatusDistribution("project-1");

    expect(analyticsRepository.getStatusDistribution).toHaveBeenCalledWith(
      "project-1",
    );
  });

  it("delegates getRecentFailures", () => {
    analyticsService.getRecentFailures("project-1");

    expect(analyticsRepository.getRecentFailures).toHaveBeenCalledWith(
      "project-1",
    );
  });
});
