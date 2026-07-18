import { Command } from "commander";
import { initCommand } from "./commands/init";
import { syncCommand } from "./commands/sync";
import { statusCommand } from "./commands/status";
import { linkCommand } from "./commands/link";
import { historyCommand } from "./commands/history";
import { cleanupCommand } from "./commands/cleanup";
import { createCommand } from "./commands/create";
import { uiCommand } from "./commands/ui";
import { viewCommand } from "./commands/view";
import { uploadCommand } from "./commands/upload";
import { projectsCommand } from "./commands/projects";

const program = new Command();

program.name("assertive").description("Assertive CLI").version("0.1.0");

program.addCommand(initCommand);
program.addCommand(syncCommand);
program.addCommand(statusCommand);
program.addCommand(linkCommand);
program.addCommand(historyCommand);
program.addCommand(cleanupCommand);
program.addCommand(createCommand);
program.addCommand(uiCommand);
program.addCommand(viewCommand);
program.addCommand(uploadCommand);
program.addCommand(projectsCommand);

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("CLI dev mode: no command provided, use pnpm --filter @assertive/cli dev sync, etc.");
  setInterval(() => {}, 1000);
} else {
  program.parse(process.argv);
}
