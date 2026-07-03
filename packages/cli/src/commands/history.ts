import { Command } from "commander";
import { apiGet } from "../lib/api";

export const historyCommand = new Command("history")
  .argument("<externalId>")
  .description("Show test history")
  .action(async (externalId) => {
    try {
      const result = await apiGet(
        `/api/history/${encodeURIComponent(externalId)}`,
      );

      console.log("");
      console.log("History");
      console.log("=======");
      console.log("");

      for (const item of result.items) {
        console.log(item.action);
        console.log(new Date(item.createdAt).toLocaleString());

        if (item.changes) {
          for (const [field, value] of Object.entries(item.changes)) {
            const change = value as {
              from: unknown;
              to: unknown;
            };

            console.log(`${field}:`);
            console.log(` ${change.from} → ${change.to}`);
          }
        }

        console.log("");
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  });
