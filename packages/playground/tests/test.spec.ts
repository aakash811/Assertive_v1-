import { test, expect } from "@playwright/test";
import { assertive } from "@assertive/helper";

test("auth.login.success", async ({ page }) => {
  await page.goto("https://example.com");

  await expect(page).toHaveTitle(/Example/);
});

test("auth.login.failure", async ({ page }) => {
  await page.goto("https://example.com");

  expect(1).toBe(2);
});

// test("checkout.payment.success", async ({ page }) => {
//   await page.goto("https://example.com");
// });

assertive.owner("auth.login.success", "Alice");

assertive.priority("auth.login.success", "high");

assertive.tags("auth.login.success", "auth", "smoke");

assertive.field("auth.login.success", "module", "authentication");
