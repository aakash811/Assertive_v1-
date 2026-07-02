import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import { apiGet } from "../lib/api";
import { findProjectRoot } from "../utils/find-project-root";

export const projectsCommand = new Command("projects").description(
  "Manage projects",
);

projectsCommand.action(async () => {
  try {
    const projects = await apiGet("/api/projects");
    console.log("");
    console.log("Projects");
    console.log("========");
    console.log("");

    for (const project of projects) {
      console.log(`${project.id}  ${project.name}`);
    }

    console.log("");
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  }
});

projectsCommand
  .command("use")
  .argument("<projectId>")
  .description("Select active project")
  .action((projectId) => {
    try {
      const root = findProjectRoot();
      const configPath = path.join(root, ".assertive.json");
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      config.projectId = projectId;

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log("");
      console.log(`✓ Selected project ${projectId}`);

      console.log("");
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  });
