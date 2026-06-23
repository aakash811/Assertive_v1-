import { Command } from "commander";
import { spawn } from "node:child_process";

function openUrl(url: string) {
  const isWindows = process.platform === "win32";
  const command = isWindows ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = isWindows ? ["/c", "start", "", url] : [url];

  spawn(command, args, {
    stdio: "ignore",
    detached: true,
  }).unref();
}

export const viewCommand = new Command("view")
  .argument("<uniqueId>")
  .description("Open a test case in the browser")
  .action((uniqueId) => {
    openUrl(`http://localhost:3000/test-cases/${encodeURIComponent(uniqueId)}`);
    console.log(`Opened test case ${uniqueId}`);
  });