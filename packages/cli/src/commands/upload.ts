import { Command } from "commander";
import fs from "node:fs";

export const uploadCommand = new Command("upload")
  .option("--format <format>", "Upload format", "junit")
  .argument("<file>")
  .description("Upload test results")
  .action((file, options) => {
    if (options.format !== "junit") {
      console.error("Only JUnit upload scaffold is available right now.");
      return;
    }

    if (!fs.existsSync(file)) {
      console.error(`File not found: ${file}`);
      return;
    }

    console.log(`Read ${file}`);
    console.log("JUnit upload scaffold is not wired yet.");
  });