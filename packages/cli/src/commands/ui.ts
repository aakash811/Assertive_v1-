import { Command } from "commander";
import { spawn, type ChildProcess } from "node:child_process";
import { platform } from "node:os";
import { loadAssertiveConfig } from "@assertive/shared";
import { findProjectRoot } from "../utils/find-project-root.js";

function openUrl(url: string) {
  const isWindows = platform() === "win32";

  const command = isWindows
    ? "cmd"
    : platform() === "darwin"
      ? "open"
      : "xdg-open";

  const args = isWindows ? ["/c", "start", "", url] : [url];

  spawn(command, args, {
    stdio: "ignore",
    detached: true,
  }).unref();
}

function startProcess(root: string, filter: "api" | "web"): ChildProcess {
  return spawn("pnpm", ["--filter", filter, "dev"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
}

export const uiCommand = new Command("ui")
  .description("Start the Assertive dashboard")
  .action(() => {
    const root = findProjectRoot();
    const config = loadAssertiveConfig(root);

    console.log("");
    console.log("Assertive Dashboard");
    console.log("==================");
    console.log(`Project: ${config.projectId ?? "unlinked"}`);
    console.log("");

    console.log("Starting API...");
    const api = startProcess(root, "api");

    console.log("Starting Web...");
    const web = startProcess(root, "web");

    console.log("");
    console.log("API:       http://localhost:4321");
    console.log("Dashboard: http://localhost:3000");
    console.log("");

    setTimeout(() => {
      console.log("Opening browser...");
      openUrl("http://localhost:3000");
    }, 5000);

    const shutdown = () => {
      console.log("");
      console.log("Stopping Assertive...");

      api.kill();
      web.kill();

      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  });
