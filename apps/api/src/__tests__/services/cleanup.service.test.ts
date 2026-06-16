import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/prisma", () => ({
  prisma: {
    testRun: {
      deleteMany: vi.fn(),
    },

    testCaseHistory: {
      deleteMany: vi.fn(),
    },
  },
}));

import { prisma } from "../../lib/prisma";

import { cleanupService } from "../../services/cleanup.services";

describe("cleanupService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cleans up runs and history", async () => {
    vi.mocked(prisma.testRun.deleteMany).mockResolvedValue({
      count: 5,
    } as never);

    vi.mocked(prisma.testCaseHistory.deleteMany).mockResolvedValue({
      count: 3,
    } as never);

    const result = await cleanupService.run();

    expect(prisma.testRun.deleteMany).toHaveBeenCalledWith({ where: {} });

    expect(prisma.testCaseHistory.deleteMany).toHaveBeenCalledWith({
      where: {},
    });

    expect(result).toEqual({
      runs: 5,
      history: 3,
      traces: 0,
    });
  });
});
