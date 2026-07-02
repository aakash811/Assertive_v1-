import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import { findProjectRoot } from "../utils/find-project-root.js";

export const initCommand = new Command("init")
  .description("Initialize Assertive in the current project")
  .action(() => {
    const root = findProjectRoot();

    const configPath = path.join(root, ".assertive.json");
    const assertiveDir = path.join(root, ".assertive");
    const gitignorePath = path.join(assertiveDir, ".gitignore");

    if (fs.existsSync(configPath)) {
      console.error("✔ Assertive is already initialized.");
      console.error(`Config already exists at ${configPath}`);
      return;
    }

    fs.mkdirSync(assertiveDir, {
      recursive: true,
    });

    const config = {
      apiUrl: "http://localhost:4321",
      apiKey: "",
      projectId: "",
      framework: "playwright",
      include: ["tests/**/*.spec.ts"],
      ignore: ["node_modules/**", "dist/**", "coverage/**"],
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, "*\n!.gitignore\n");
    }

    console.log("");
    console.log("🚀 Assertive initialized successfully.");
    console.log("");
    console.log("Created:");
    console.log("  ✓ .assertive.json");
    console.log("  ✓ .assertive/.gitignore");
    console.log("");
    console.log("Next steps:");
    console.log("");
    console.log("  1. Edit .assertive.json and add your API key.");
    console.log("  2. Run: assertive projects");
    console.log("  3. Run: assertive link <projectId>");
    console.log("  4. Run: assertive sync");
    console.log("  5. Start the dashboard with: assertive ui");
    console.log("");
  });
