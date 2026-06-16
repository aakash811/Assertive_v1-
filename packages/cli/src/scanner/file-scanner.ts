import path from "node:path";
import fg from "fast-glob";
import { findProjectRoot } from "../utils/find-project-root.js";
import { loadConfig } from "../utils/load-config.js";

export async function scanFiles() {
  const root = findProjectRoot();
  const config = loadConfig();

  const patterns = config.include ?? ["**/*.spec.ts", "**/*.test.ts"];

  const ignore = ["**/node_modules/**", "**/dist/**", ...(config.ignore ?? [])];

  const files = await fg(patterns, {
    cwd: root,
    ignore,
    absolute: true,
  });

  return files.map((file) => ({
    absolutePath: file,
    relativePath: path.relative(root, file),
  }));
}
