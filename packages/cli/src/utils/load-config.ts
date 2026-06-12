import fs from "node:fs";
import path from "node:path";
import { findProjectRoot } from "./find-project-root";

export interface AssertiveConfig {
  apiUrl: string;
  apiKey: string;
  framework: string;
}

export function loadConfig(): AssertiveConfig {
  const projectRoot = findProjectRoot();
  const configPath = path.join(projectRoot, ".assertive.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(
      "Missing .assertive.json. Run 'assertive init' to create one.",
    );
  }

  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}
