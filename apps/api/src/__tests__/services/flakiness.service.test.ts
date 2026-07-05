import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/test-run.repository", () => ({
  testRunRepository: {
    findRecentByTestCase: vi.fn(),
  },
}));

vi.mock("../../repositories/test-case.repository", () => ({
  testCaseRepository: {
    updateFlakiness: vi.fn(),
  },
}));

import { testRunRepository } from "../../repositories/test-run.repository";
import { testCaseRepository } from "../../repositories/test-case.repository";
import { flakinessService } from "../../services/flakiness.service";

describe("flakinessService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when fewer than 2 runs exist", async () => {
    vi.mocked(
      testRunRepository.findRecentByTestCase,
    ).mockResolvedValue([
      {
        status: "PASSED",
      },
    ] as any);

    await flakinessService.recalculate("tc1");

    expect(
      testCaseRepository.updateFlakiness,
    ).not.toHaveBeenCalled();
  });

  it("marks stable test as not flaky", async () => {
    vi.mocked(
      testRunRepository.findRecentByTestCase,
    ).mockResolvedValue([
      { status: "PASSED" },
      { status: "PASSED" },
      { status: "PASSED" },
    ] as any);

    await flakinessService.recalculate("tc1");

    expect(
      testCaseRepository.updateFlakiness,
    ).toHaveBeenCalledWith(
      "tc1",
      0,
    );
  });

  it("marks unstable test as flaky", async () => {
    vi.mocked(
      testRunRepository.findRecentByTestCase,
    ).mockResolvedValue([
      { status: "PASSED" },
      { status: "FAILED" },
      { status: "PASSED" },
      { status: "FAILED" },
    ] as any);

    await flakinessService.recalculate("tc1");

    expect(
      testCaseRepository.updateFlakiness,
    ).toHaveBeenCalled();

    const call =
      vi.mocked(
        testCaseRepository.updateFlakiness,
      ).mock.calls[0];

    expect(call[0]).toBe("tc1");
    expect(call[1]).toBeGreaterThan(0.3);
  });
});