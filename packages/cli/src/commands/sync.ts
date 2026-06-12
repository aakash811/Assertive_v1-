import { Command } from "commander";

import { discoverPlaywrightTests } from "../discovery/discover-playwright.js";

import { apiPost } from "../lib/api.js";

export const syncCommand = new Command("sync")
  .description("Sync tests with Assertive")
  .action(async () => {
    try {
      console.log("Discovering tests...");

      const tests = await discoverPlaywrightTests();

      console.log(`Found ${tests.length} tests`);

      const result = await apiPost("/api/sync", {
        testCases: tests,
      });

      console.log("");
      console.log("Sync Complete");
      console.log("=============");

      console.log(`Synced: ${result.synced}`);

      console.log(`Stale: ${result.stale}`);

      console.log("");
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  });
