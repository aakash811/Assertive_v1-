import { Command } from "commander";
import { apiGet } from "../lib/api";

export const projectsCommand = new Command("projects")
  .description("List projects")
  .action(async () => {
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
