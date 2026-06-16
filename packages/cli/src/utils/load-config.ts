import fs from "node:fs";
import path from "node:path";
import { findProjectRoot } from "./find-project-root";
import { AssertiveConfig } from "../types/config";
export function loadConfig(): AssertiveConfig {
  const projectRoot = findProjectRoot();
  const configPath = path.join(projectRoot, ".assertive.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(
      "Missing .assertive.json. Run 'assertive init' to create one.",
    );
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  if (!config.apiUrl) {
    throw new Error("Missing apiUrl in .assertive.json");
  }

  if (!config.apiKey) {
    throw new Error("Missing apiKey in .assertive.json");
  }

  return config;
}
