import { Command } from "commander";
import { spawn } from "node:child_process";
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

export const uiCommand = new Command("ui")
  .description("Start the API and dashboard")
  .action(() => {
    const root = findProjectRoot();
    const config = loadAssertiveConfig();

    console.log(`Using project ${config.projectId ?? "unlinked"}`);
    console.log(`Workspace root: ${root}`);
    console.log("Start the API with: pnpm --filter api dev");
    console.log("Start the web app with: pnpm --filter web dev");
    openUrl("http://localhost:3000");
  });
