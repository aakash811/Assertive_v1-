import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import { findProjectRoot } from "../utils/find-project-root";

export const initCommand = new Command("init")
  .description("Initialize Assertive")
  .action(() => {
    const projectRoot = findProjectRoot();
    const configPath = path.join(projectRoot, ".assertive.json");

    if (fs.existsSync(configPath)) {
      console.error(".assertive.json already exists");
      return;
    }

    const config = {
      apiUrl: "http://localhost:4321",
      apiKey: "API-KEY",
      framework: "playwright",
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(`✓ Created ${configPath}`);
  });
