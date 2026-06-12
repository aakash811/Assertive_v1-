import { Command } from "commander";
import { apiGet } from "../lib/api";
import chalk from "chalk";

export const statusCommand = new Command("status")
  .description("Project Status")
  .action(async () => {
    try {
      const metrics = await apiGet("/api/metrics/summary");
      console.log("");
      console.log("Assertive Status");
      console.log("================");
      console.log("");

      console.log(`Total Tests : ${metrics.totalTests}`);

      console.log(`Run Batches : ${metrics.runBatches}`);

      console.log(chalk.green(`Passed Runs : ${metrics.passedRuns}`));

      console.log(chalk.red(`Failed Runs : ${metrics.failedRuns}`));

      console.log(chalk.yellow(`Flaky Tests : ${metrics.flakyTests}`));

      console.log(chalk.cyan(`Pass Rate   : ${metrics.passRate}%`));

      console.log("");
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  });
