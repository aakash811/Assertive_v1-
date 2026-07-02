import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";

import { loadAssertiveConfig } from "@assertive/shared";
import { findProjectRoot } from "../utils/find-project-root.js";

export const linkCommand = new Command("link")
  .description("Link project")
  .argument("<projectId>")
  .action((projectId) => {
    const root = findProjectRoot();
    const config = loadAssertiveConfig(root);
    const configPath = path.join(root, ".assertive.json");

    const updatedConfig = {
      ...config,
      projectId,
    };

    fs.writeFileSync(
      configPath,
      JSON.stringify(updatedConfig, null, 2),
      "utf8",
    );

    console.log(`Linked project ${projectId} to Assertive`);
  });
