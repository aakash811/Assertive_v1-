import { test, expect } from "@playwright/test";

import { assertive } from "@assertive/helper";

test.describe("Auth", () => {
  test("auth.login.success", async () => {
    assertive.owner("auth.login.success", "Alice");

    assertive.priority("auth.login.success", "high");

    assertive.tags("auth.login.success", "auth", "smoke");

    assertive.field("auth.login.success", "jira", "AUTH-123");

    assertive.field("auth.login.success", "team", "platform");

    expect(1 + 1).toBe(2);
  });

  test("auth.login.failure", async () => {
    expect(1 + 1).toBe(2);
  });
});
