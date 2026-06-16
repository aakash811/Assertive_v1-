import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../repositories/api-key.repository", () => ({
  apiKeyRepository: {
    create: vi.fn(),
  },
}));

import { apiKeyRepository } from "../../repositories/api-key.repository";
import { apiKeyService } from "../../services/api-key.service";

describe("apiKeyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates api key", async () => {
    const fakeApiKey = {
      id: "key-1",
      name: "local-dev",
      hashedKey: "hashed",
      projectId: "project-1",
    };

    vi.mocked(apiKeyRepository.create).mockResolvedValue(fakeApiKey as never);

    const result = await apiKeyService.create("project-1", "local-dev");

    expect(result.rawKey).toContain("ask_live_");
    expect(result.apiKey).toEqual(fakeApiKey);
    expect(apiKeyRepository.create).toHaveBeenCalledTimes(1);
    expect(apiKeyRepository.create).toHaveBeenCalledWith({
      name: "local-dev",
      projectId: "project-1",
      hashedKey: expect.any(String),
    });
  });
});
