import { describe, expect, it } from "vitest";

import { config } from "../../lib/config";

describe("config", () => {
  it("loads defaults", () => {
    expect(config.port).toBeDefined();
    expect(config.nodeEnv).toBeDefined();
    expect(config.retention.traces).toBeDefined();
  });
});
