import { describe, expect, it } from "vitest";

import { getRetentionMs } from "../retention";

describe("retention", () => {
  it("parses days", () => {
    expect(getRetentionMs("2d")).toBe(2 * 24 * 60 * 60 * 1000);
  });

  it("parses hours", () => {
    expect(getRetentionMs("3h")).toBe(3 * 60 * 60 * 1000);
  });

  it("falls back for invalid values", () => {
    expect(getRetentionMs("hello")).toBe(30 * 24 * 60 * 60 * 1000);
  });
});
