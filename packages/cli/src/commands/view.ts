import { Command } from "commander";
import { spawn } from "node:child_process";
import { apiGet } from "../lib/api";

function openUrl(url: string) {
  const isWindows = process.platform === "win32";
  const command = isWindows
    ? "cmd"
    : process.platform === "darwin"
      ? "open"
      : "xdg-open";

  const args = isWindows ? ["/c", "start", "", url] : [url];

  spawn(command, args, {
    stdio: "ignore",
    detached: true,
  }).unref();
}

export const viewCommand = new Command("view")
  .argument("<uniqueId>")
  .description("Open a test case in the browser")
  .action(async (uniqueId) => {
    try {
      const testCase = await apiGet(
        `/api/test-cases/by-unique-id/${encodeURIComponent(uniqueId)}`,
      );

      const id = testCase.id;
      const url = `http://localhost:3000/test-cases/${id}`;

      openUrl(url);
      console.log(`Opened ${url}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (
        message.includes("fetch") ||
        message.includes("ECONNREFUSED") ||
        message.includes("Failed to fetch")
      ) {
        console.error("");
        console.error("Assertive server is not running.");
        console.error("Run:");
        console.error("  assertive ui");
        console.error("");
        return;
      }

      console.error(message);
    }
  });
