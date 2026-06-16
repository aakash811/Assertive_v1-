"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const file_scanner_js_1 = require("../scanner/file-scanner.js");
const annotation_parser_js_1 = require("../parser/annotation-parser.js");
const find_duplicates_js_1 = require("../utils/find-duplicates.js");
const api_js_1 = require("../lib/api.js");
const get_changed_files_js_1 = require("../utils/get-changed-files.js");
exports.syncCommand = new commander_1.Command("sync")
    .description("Sync tests with Assertive")
    .option("--dry-run", "Preview changes without syncing")
    .option("--debug", "Show sync payload")
    .action(async (options) => {
    try {
        console.log("Discovering tests...");
        const files = await (0, file_scanner_js_1.scanFiles)();
        console.log(`Found ${files.length} test files`);
        const changedFiles = (0, get_changed_files_js_1.getChangedFiles)(files);
        console.log(`Files changed: ${changedFiles.length}`);
        const testCases = [];
        for (const file of files) {
            const parsed = await (0, annotation_parser_js_1.parseTestFile)(file.absolutePath);
            testCases.push(...parsed);
        }
        const duplicates = (0, find_duplicates_js_1.findDuplicates)(testCases);
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
        const result = await (0, api_js_1.apiPost)("/api/sync", { testCases });
        console.log("");
        console.log(chalk_1.default.green(`✓ ${result.synced} test cases synced`));
        console.log(chalk_1.default.blue(`+ ${result.created} new test cases`));
        console.log(chalk_1.default.yellow(`↻ ${result.updated} updated`));
        console.log(chalk_1.default.magenta(`⟳ ${result.restored} restored`));
        console.log(chalk_1.default.red(`⚠ ${result.stale} stale`));
        console.log("");
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : error);
    }
});
