import fs from "node:fs/promises";
import path from "node:path";

const TRACE_DIRECTORY = path.resolve(
  process.cwd(),
  "..",
  "..",
  "storage",
  "traces",
);

function parseRetention(value: string) {
  const match = /^(\d+)([dh])$/.exec(value);

  if (!match) {
    return 30 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);

  switch (match[2]) {
    case "d":
      return amount * 24 * 60 * 60 * 1000;

    case "h":
      return amount * 60 * 60 * 1000;

    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
}

export async function cleanupExpiredTraces() {
  const retention = parseRetention(process.env.RETENTION_TRACES ?? "30d");

  const files = await fs.readdir(TRACE_DIRECTORY).catch(() => []);

  const now = Date.now();

  for (const file of files) {
    const full = path.join(TRACE_DIRECTORY, file);

    const stat = await fs.stat(full);

    if (now - stat.mtimeMs > retention) {
      await fs.unlink(full);
    }
  }
}
