import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/prisma", () => ({
  prisma: {
    testRun: {
      findMany: vi.fn(),
    },

    testCase: {
      update: vi.fn(),
    },
  },
}));

import { prisma } from "../../lib/prisma";
import { flakinessService } from "../../services/flakiness.service";

describe("flakinessService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when fewer than 2 runs exist", async () => {
    vi.mocked(prisma.testRun.findMany).mockResolvedValue([
      {
        status: "PASSED",
      },
    ] as any);

    await flakinessService.recalculate("tc1");
    expect(prisma.testCase.update).not.toHaveBeenCalled();
  });

  it("marks stable test as not flaky", async () => {
    vi.mocked(prisma.testRun.findMany).mockResolvedValue([
      { status: "PASSED" },
      { status: "PASSED" },
      { status: "PASSED" },
    ] as any);

    await flakinessService.recalculate("tc1");

    expect(prisma.testCase.update).toHaveBeenCalledWith({
      where: {
        id: "tc1",
      },

      data: {
        flakyScore: 0,
        isFlaky: false,
      },
    });
  });

  it("marks unstable test as flaky", async () => {
    vi.mocked(prisma.testRun.findMany).mockResolvedValue([
      { status: "PASSED" },
      { status: "FAILED" },
      { status: "PASSED" },
      { status: "FAILED" },
    ] as any);

    await flakinessService.recalculate("tc1");
    expect(prisma.testCase.update).toHaveBeenCalled();

    const call = vi.mocked(prisma.testCase.update).mock.calls[0][0];
    expect(call.data.isFlaky).toBe(true);

    expect(call.data.flakyScore).toBeGreaterThan(0.3);
  });
});
