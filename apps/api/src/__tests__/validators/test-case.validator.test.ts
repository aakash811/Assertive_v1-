import { describe, expect, it } from "vitest";
import {
  createTestCaseSchema,
  updateTestCaseSchema,
  discoverTestCasesSchema,
} from "../../validators/test-case.validator";

describe("createTestCaseSchema", () => {
  it("accepts valid payload", () => {
    const result = createTestCaseSchema.parse({
      uniqueId: "auth.login",
      title: "Login",
    });

    expect(result.uniqueId).toBe("auth.login");
  });

  it("rejects empty uniqueId", () => {
    expect(() =>
      createTestCaseSchema.parse({
        uniqueId: "",
        title: "Login",
      }),
    ).toThrow();
  });
});

describe("updateTestCaseSchema", () => {
  it("accepts partial update", () => {
    const result = updateTestCaseSchema.parse({
      title: "Updated",
    });

    expect(result.title).toBe("Updated");
  });
});

describe("discoverTestCasesSchema", () => {
  it("accepts valid payload", () => {
    const result = discoverTestCasesSchema.parse({
      uniqueId: "auth.login",
      title: "Login",
    });

    expect(result.title).toBe("Login");
  });
});
