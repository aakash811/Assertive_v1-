import { describe, expect, it } from "vitest";
import { manualOverrideValidator } from "../../validators/manual-override.validator";

describe("manualOverrideValidator", () => {
  it("accepts valid input", () => {
    const result = manualOverrideValidator.parse({
      status: "PASSED",
      comment: "Verified manually",
    });

    expect(result.status).toBe("PASSED");
  });

  it("rejects invalid status", () => {
    expect(() =>
      manualOverrideValidator.parse({
        status: "INVALID",
        comment: "test",
      }),
    ).toThrow();
  });

  it("rejects short comment", () => {
    expect(() =>
      manualOverrideValidator.parse({
        status: "FAILED",
        comment: "ok",
      }),
    ).toThrow();
  });

  it("rejects long comment", () => {
    expect(() =>
      manualOverrideValidator.parse({
        status: "FAILED",
        comment: "a".repeat(501),
      }),
    ).toThrow();
  });
});
