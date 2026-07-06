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
});