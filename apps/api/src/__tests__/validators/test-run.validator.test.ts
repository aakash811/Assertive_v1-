import { describe, expect, it } from "vitest";
import { createTestRunSchema } from "../../validators/test-run.validators";

describe("createTestRunSchema", () => {
  it("accepts valid payload", () => {
    const result = createTestRunSchema.parse({
      testCaseId: "1",
      runBatchId: "2",
      status: "PASSED",
    });

    expect(result.status).toBe("PASSED");
  });

  it("rejects invalid status", () => {
    expect(() =>
      createTestRunSchema.parse({
        testCaseId: "1",
        runBatchId: "2",
        status: "INVALID",
      }),
    ).toThrow();
  });
});
