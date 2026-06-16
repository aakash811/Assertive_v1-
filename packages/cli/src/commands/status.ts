import { Command } from "commander";

import { apiGet } from "../lib/api";

export const statusCommand = new Command("status")
  .description("Show sync status")
  .action(async () => {
    try {
      const result = await apiGet("/api/status");

      console.log("");

      console.log("Project Status");

      console.log("==============");

      console.log(`Total: ${result.total}`);

      console.log(`Synced: ${result.synced}`);

      console.log(`Stale: ${result.stale}`);

      console.log("");
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  });
