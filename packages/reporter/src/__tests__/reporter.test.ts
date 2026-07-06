import { describe, expect, it } from "vitest";

describe("AssertiveReporter", () => {
  it("can be constructed", async () => {
    const { AssertiveReporter } = await import("../reporter.js");

    expect(new AssertiveReporter()).toBeDefined();
  });
});