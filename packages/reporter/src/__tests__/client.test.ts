import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssertiveClient } from "../client";

describe("AssertiveClient", () => {
  const client = new AssertiveClient({
    apiKey: "secret",
    apiUrl: "http://localhost:4321",
    retries: 3,
    uploadTraces: false,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates run batch", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: "batch-1" },
      }),
    } as Response);

    const result = await client.createRunBatch({
      branch: "main",
      environment: "local",
    });

    expect(result.id).toBe("batch-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4321/api/run-batches",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("throws api error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      statusText: "Unauthorized",
      json: async () => ({
        success: false,
        error: {
          message: "Invalid API key",
        },
      }),
    } as Response);

    await expect(
      client.createRunBatch({
        branch: "main",
        environment: "local",
      }),
    ).rejects.toThrow("Invalid API key");
  });
});
