import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import { loadAssertiveConfig } from "@assertive/shared";
import { findProjectRoot } from "../utils/find-project-root.js";

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const createCommand = new Command("create")
  .argument("<title>")
  .option("--suite <suite>")
  .option("--tags <tags...>")
  .option("--type <type>")
  .option("--priority <priority>")
  .description("Create a new Playwright test scaffold")
  .action((title, options) => {
    const config = loadAssertiveConfig();
    const root = findProjectRoot();
    const testsDir = path.join(root, "tests");
    fs.mkdirSync(testsDir, { recursive: true });

    const fileName = `${toSlug(title) || "new-test"}.spec.ts`;
    const filePath = path.join(testsDir, fileName);
    const uniqueId = `${config.projectId ?? "TST"}-${Date.now().toString().slice(-4)}`;

    if (fs.existsSync(filePath)) {
      console.error(`${fileName} already exists`);
      return;
    }

    const tags = Array.isArray(options.tags) ? options.tags : [];

    const content = [
      'import { test, expect } from "@playwright/test";',
      'import { assertive } from "@assertive/helper";',
      "",
      `test(${JSON.stringify(title)}, async () => {`,
      `  assertive.id(${JSON.stringify(title)}, ${JSON.stringify(uniqueId)});`,
    ];

    if (options.suite) {
      content.push(
        `  assertive.field(${JSON.stringify(title)}, "suite", ${JSON.stringify(options.suite)});`,
      );
    }

    if (options.type) {
      content.push(
        `  assertive.type(${JSON.stringify(title)}, ${JSON.stringify(options.type)});`,
      );
    }

    if (options.priority) {
      content.push(
        `  assertive.priority(${JSON.stringify(title)}, ${JSON.stringify(options.priority)});`,
      );
    }

    if (tags.length) {
      content.push(
        `  assertive.tags(${JSON.stringify(title)}, ${tags.map((tag: string) => JSON.stringify(tag)).join(", ")});`,
      );
    }

    content.push("", "  expect(true).toBeTruthy();", "});", "");

    fs.writeFileSync(filePath, content.join("\n"));

    console.log(`Created ${path.relative(root, filePath)}`);
  });
