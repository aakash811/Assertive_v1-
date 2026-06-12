import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";

import { findProjectRoot } from "../utils/find-project-root.js";

export async function discoverPlaywrightTests() {
  const root = findProjectRoot();

  const files = await glob("**/*.spec.ts", {
    cwd: root,
    ignore: ["**/node_modules/**", "**/dist/**"],
  });

  const tests = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(root, file), "utf8");

    const matches = content.matchAll(/test\(\s*["'`](.*?)["'`]/g);

    for (const match of matches) {
      tests.push({
        uniqueId: match[1],
        title: match[1],
      });
    }
  }

  return tests;
}
