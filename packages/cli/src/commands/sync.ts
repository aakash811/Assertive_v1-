import { Command } from "commander";
import chalk from "chalk";
import { scanFiles } from "../scanner/file-scanner.js";
import { parseTestFile } from "../parser/annotation-parser.js";
import { findDuplicates } from "../utils/find-duplicates.js";
import type { SyncTestCase } from "@assertive/shared";
import { apiPost } from "../lib/api.js";
import { getChangedFiles } from "../utils/get-changed-files.js";
import { loadAssertiveConfig } from "@assertive/shared";
import { findProjectRoot } from "../utils/find-project-root.js";
import { readCache, writeCache, hashFile } from "../utils/sync-cache.js";


export const syncCommand = new Command("sync")
  .description("Sync tests with Assertive")
  .option("--dry-run", "Preview changes without syncing")
  .option("--debug", "Show sync payload")
  .action(async (options) => {
    try {
      const root = findProjectRoot();
      const config = loadAssertiveConfig(root);

      if (!config.projectId) {
        throw new Error(
          "Missing projectId in .assertive.json. Run 'assertive link <projectId>' first.",
        );
      }
      if (!config.apiKey) {
        throw new Error("Missing apiKey");
      }

      if (!config.apiUrl) {
        throw new Error("Missing apiUrl");
      }

      console.log("Discovering tests...");
      const files = await scanFiles();
      const activeFiles = new Set(
        files.map((f) => f.absolutePath),
      );
      console.log(`Found ${files.length} test files`);

      const changedFiles = getChangedFiles(files);
      console.log(`Files changed: ${changedFiles.length}`);

      const testCases: SyncTestCase[] = [];
      const parserErrors: {
        file: string;
        test?: string;
        message: string;
      }[] = [];

      const cache = readCache();

      for (const file of files) {
        const isChanged = changedFiles.includes(file.absolutePath);

        if (isChanged) {
          const parsed = await parseTestFile(file.absolutePath);

          testCases.push(...parsed.tests);

          parserErrors.push(...parsed.errors);

          cache[file.absolutePath] = {
            hash: hashFile(file.absolutePath),
            tests: parsed.tests,
          };
        } else {
          testCases.push(...(cache[file.absolutePath]?.tests ?? []));
        }
      }

      for (const cachedFile of Object.keys(cache)) {
        if (!activeFiles.has(cachedFile)) {
          delete cache[cachedFile];
        }
      }

      writeCache(cache);
      if (parserErrors.length) {
        console.log("");
        console.log(chalk.yellow("Parser Errors"));
        console.log("================");

        for (const error of parserErrors) {
          console.log(chalk.red(`✗ ${error.file}`));

          if (error.test) {
            console.log(`  Test: ${error.test}`);
          }

          console.log(`  ${error.message}`);
          console.log("");
        }
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

      const result = await apiPost(`/api/projects/${config.projectId}/sync`, {
        testCases,
      });

      console.log("");
      console.log(chalk.green(`✓ ${result.synced} test cases synced`));
      console.log(chalk.blue(`+ ${result.created} new test cases`));
      console.log(chalk.yellow(`↻ ${result.updated} updated`));
      console.log(chalk.magenta(`⟳ ${result.restored} restored`));
      console.log(chalk.red(`⚠ ${result.stale} stale`));
      console.log("");

      if (parserErrors.length) {
        console.log(
          chalk.yellow(
            `⚠ ${parserErrors.length} parser error(s) encountered`,
          ),
        );
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  });
