import fs from "node:fs";
import path from "node:path";
import {
  assertiveConfigSchema,
  type AssertiveConfig,
} from "./assertive-config";

export function loadAssertiveConfig(root = process.cwd()): AssertiveConfig {
  const configPath = path.join(root, ".assertive.json");

  if (!fs.existsSync(configPath)) {
    throw new Error("Missing .assertive.json");
  }

  const raw = JSON.parse(fs.readFileSync(configPath, "utf8"));

  return assertiveConfigSchema.parse(raw);
}
