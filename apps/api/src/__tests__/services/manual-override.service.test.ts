import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

vi.mock("../../services/history.service", () => ({
  historyService: {
    create: vi.fn(),
  },
}));

import { prisma } from "../../lib/prisma";
import { manualOverrideService } from "../../services/manual-override.service";

describe("manualOverrideService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when test case is missing", async () => {
    (prisma.$transaction as any).mockImplementation(async (fn: any) =>
      fn({
        testCase: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      }),
    );

    await expect(
      manualOverrideService.overrideStatus("project-1", "tc1", "FAILED", "comment"),
    ).rejects.toThrow("Test case not found");
  });
});
