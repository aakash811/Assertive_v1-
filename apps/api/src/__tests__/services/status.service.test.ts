import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/status.repository", () => ({
  statusRepository: {
    get: vi.fn(),
  },
}));

vi.mock("../../lib/metrics-cache", () => ({
  getCached: vi.fn(),
  setCached: vi.fn(),
}));

import { statusRepository } from "../../repositories/status.repository";
import { getCached, setCached } from "../../lib/metrics-cache";
import { statusService } from "../../services/status.service";

describe("statusService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns and caches status", async () => {
    const fakeStatus = {
      total: 10,
      synced: 8,
      stale: 2,
    };

    vi.mocked(getCached).mockReturnValue(undefined);
    vi.mocked(statusRepository.get).mockResolvedValue(fakeStatus);

    const result = await statusService.get("project-1");

    expect(statusRepository.get).toHaveBeenCalledWith("project-1");
    expect(setCached).toHaveBeenCalledWith("status:project-1", fakeStatus);

    expect(result).toEqual(fakeStatus);
  });

  it("returns cached status", async () => {
    const fakeStatus = {
      total: 10,
      synced: 8,
      stale: 2,
    };

    vi.mocked(getCached).mockReturnValue(fakeStatus);

    const result = await statusService.get("project-1");

    expect(statusRepository.get).not.toHaveBeenCalled();
    expect(result).toEqual(fakeStatus);
  });
});
