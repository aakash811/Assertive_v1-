import { Command } from "commander";
import chalk from "chalk";
import { scanFiles } from "../scanner/file-scanner.js";
import { parseTestFile } from "../parser/annotation-parser.js";
import { findDuplicates } from "../utils/find-duplicates.js";
import type { SyncTestCase } from "@assertive/shared";
import { apiPost } from "../lib/api.js";
import { getChangedFiles } from "../utils/get-changed-files.js";

export const syncCommand = new Command("sync")
  .description("Sync tests with Assertive")
  .option("--dry-run", "Preview changes without syncing")
  .option("--debug", "Show sync payload")
  .action(async (options) => {
    try {
      console.log("Discovering tests...");
      const files = await scanFiles();
      console.log(`Found ${files.length} test files`);

      const changedFiles = getChangedFiles(files);
      console.log(`Files changed: ${changedFiles.length}`);

      const testCases: SyncTestCase[] = [];

      for (const file of files) {
        const parsed = await parseTestFile(file.absolutePath);
        testCases.push(...parsed);
      }

      const duplicates = findDuplicates(testCases);

      if (duplicates.length) {
        console.error("");
        console.error("Duplicate test IDs found:");
        console.error(duplicates.join("\n"));

        process.exit(1);
      }

      // console.log(JSON.stringify(testCases, null, 2));
      if (options.dryRun) {
        console.log("");
        console.log("Dry Run");
        console.log("=======");
        console.log(`Files scanned: ${files.length}`);
        console.log(`Tests discovered: ${testCases.length}`);
        console.log("");
        for (const test of testCases) {
          console.log(`+ ${test.title}`);
        }
        console.log("");
        console.log("No changes were made.");
        console.log("");
        return;
      }

      if (options.debug) {
        console.log("");
        console.log(JSON.stringify(testCases, null, 2));
      }

      const result = await apiPost("/api/sync", { testCases });

      console.log("");
      console.log(chalk.green(`✓ ${result.synced} test cases synced`));
      console.log(chalk.blue(`+ ${result.created} new test cases`));
      console.log(chalk.yellow(`↻ ${result.updated} updated`));
      console.log(chalk.magenta(`⟳ ${result.restored} restored`));
      console.log(chalk.red(`⚠ ${result.stale} stale`));
      console.log("");
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  });
