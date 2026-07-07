import { describe, expect, it } from "vitest";
import { resolveConfig } from "../config";

describe("resolveConfig", () => {
  it("uses defaults", () => {
    const config = resolveConfig();

    expect(config.uploadTraces).toBe(false);
    expect(config.retries).toBe(3);
  });

  it("accepts overrides", () => {
    const config = resolveConfig({
      uploadTraces: true,
      retries: 5,
    });

    expect(config.uploadTraces).toBe(true);
    expect(config.retries).toBe(5);
  });

  it("reads env vars", () => {
    process.env.ASSERTIVE_API_URL = "http://api";
    process.env.ASSERTIVE_API_KEY = "abc";

    const config = resolveConfig();

    expect(config.apiUrl).toBe("http://api");
    expect(config.apiKey).toBe("abc");
  });
});
