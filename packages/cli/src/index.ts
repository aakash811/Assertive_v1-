import { Command } from "commander";
import { initCommand } from "./commands/init";
import { syncCommand } from "./commands/sync";
import { statusCommand } from "./commands/status";
import { linkCommand } from "./commands/link";
import { historyCommand } from "./commands/history";
import { cleanupCommand } from "./commands/cleanup";

const program = new Command();

program.name("assertive").description("Assertive CLI").version("0.1.0");

program.addCommand(initCommand);
program.addCommand(syncCommand);
program.addCommand(statusCommand);
program.addCommand(linkCommand);
program.addCommand(historyCommand);
program.addCommand(cleanupCommand);

program.parse();
