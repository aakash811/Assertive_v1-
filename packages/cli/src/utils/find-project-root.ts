import fs from "node:fs";
import path from "node:path";

export function findProjectRoot() {
  let current = process.cwd();

  while (current !== path.dirname(current)) {
    if (
      fs.existsSync(path.join(current, ".git")) ||
      fs.existsSync(path.join(current, "pnpm-workspace.yaml"))
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  return process.cwd();
}
