import { describe, expect, it } from "vitest";
import {
  createTestCaseSchema,
  updateTestCaseSchema,
  discoverTestCasesSchema,
} from "../../validators/test-case.validator";

describe("createTestCaseSchema", () => {
  it("accepts valid payload", () => {
    const result = createTestCaseSchema.parse({
      externalId: "auth.login",
      title: "Login",
    });

    expect(result.externalId).toBe("auth.login");
  });

  it("rejects empty externalId", () => {
    expect(() =>
      createTestCaseSchema.parse({
        externalId: "",
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
      externalId: "auth.login",
      title: "Login",
    });

    expect(result.title).toBe("Login");
  });
});
