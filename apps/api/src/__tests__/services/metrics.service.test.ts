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
      totalRuns: 10,

      passedRuns: 8,
    } as never);

    const result = await metricsService.getSummary("project-1");

    expect(result.passRate).toBe(80);

    expect(metricsRepository.getSummary).toHaveBeenCalledWith("project-1");
  });

  it("returns zero pass rate when no runs exist", async () => {
    vi.mocked(metricsRepository.getSummary).mockResolvedValue({
      totalRuns: 0,

      passedRuns: 0,
    } as never);

    const result = await metricsService.getSummary("project-1");

    expect(result.passRate).toBe(0);
  });
});
