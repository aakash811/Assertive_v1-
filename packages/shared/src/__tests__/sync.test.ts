import { describe, expect, it } from "vitest";
import type { SyncPayload, SyncResponse, SyncTestCase } from "../sync";

describe("SyncTestCase", () => {
  it("creates a valid test case object", () => {
    const testCase: SyncTestCase = {
      uniqueId: "TST-001",
      title: "Login works",
      filePath: "tests/auth/login.spec.ts",
      tags: ["auth"],
      customFields: {},
    };

    expect(testCase.uniqueId).toBe("TST-001");
    expect(testCase.title).toBe("Login works");
    expect(testCase.tags).toContain("auth");
  });

  it("supports optional properties", () => {
    const testCase: SyncTestCase = {
      uniqueId: "TST-002",
      title: "Checkout",
      filePath: "tests/checkout.spec.ts",
      owner: "Alice",
      priority: "high",
      testType: "e2e",
      suite: "Checkout",
      tags: ["payment"],
      customFields: {
        browser: "chromium",
      },
    };

    expect(testCase.owner).toBe("Alice");
    expect(testCase.priority).toBe("high");
    expect(testCase.testType).toBe("e2e");
    expect(testCase.suite).toBe("Checkout");
  });
});

describe("SyncPayload", () => {
  it("contains an array of test cases", () => {
    const payload: SyncPayload = {
      testCases: [
        {
          uniqueId: "TST-001",
          title: "Login",
          filePath: "tests/login.spec.ts",
          tags: [],
          customFields: {},
        },
      ],
    };

    expect(payload.testCases).toHaveLength(1);
  });
});

describe("SyncResponse", () => {
  it("returns sync statistics", () => {
    const response: SyncResponse = {
      synced: 10,
      stale: 2,
    };

    expect(response.synced).toBe(10);
    expect(response.stale).toBe(2);
  });
});
