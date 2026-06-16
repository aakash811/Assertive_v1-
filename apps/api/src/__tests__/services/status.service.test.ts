import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/status.repository", () => ({
  statusRepository: {
    get: vi.fn(),
  },
}));

import { statusRepository } from "../../repositories/status.repository";

import { statusService } from "../../services/status.service";

describe("statusService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns status data", async () => {
    const fakeStatus = {
      total: 10,
      passed: 6,
      failed: 3,
      skipped: 1,
    };

    vi.mocked(statusRepository.get).mockResolvedValue(fakeStatus as never);

    const result = await statusService.get("project-1");

    expect(statusRepository.get).toHaveBeenCalledTimes(1);
    expect(statusRepository.get).toHaveBeenCalledWith("project-1");
    expect(result).toEqual(fakeStatus);
  });
});
