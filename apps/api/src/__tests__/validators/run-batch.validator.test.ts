import { describe, expect, it } from "vitest";
import {
  createRunBatchSchema,
  uploadResultsSchema,
} from "../../validators/run-batch.validator";

describe("createRunBatchSchema", () => {
  it("accepts empty payload", () => {
    expect(createRunBatchSchema.parse({})).toEqual({});
  });

  it("accepts valid payload", () => {
    const result = createRunBatchSchema.parse({
      branch: "main",
      environment: "prod",
      commitSha: "abc123",
    });

    expect(result.branch).toBe("main");
  });
});

describe("uploadResultsSchema", () => {
  it("accepts valid results", () => {
    const result = uploadResultsSchema.parse({
      results: [
        {
          externalId: "auth.login",
          status: "PASSED",
        },
      ],
    });

    expect(result.results).toHaveLength(1);
  });

  it("rejects invalid status", () => {
    expect(() =>
      uploadResultsSchema.parse({
        results: [
          {
            externalId: "auth",
            status: "UNKNOWN",
          },
        ],
      }),
    ).toThrow();
  });
});
