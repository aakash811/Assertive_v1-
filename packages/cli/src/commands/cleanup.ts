import { Command } from "commander";
import { apiPost } from "../lib/api";

export const cleanupCommand = new Command("cleanup")
  .description("Cleanup expired data")

  .action(async () => {
    try {
      const result = await apiPost("/api/cleanup");
      console.log("");
      console.log("Cleanup Complete");
      console.log("==============");
      console.log(`Runs deleted: ${result.runs}`);
      console.log(`History deleted: ${result.history}`);
      console.log(`Traces deleted: ${result.traces}`);
      console.log("");
    } catch (error) {
      console.error(error);
    }
  });
