import fs from "node:fs/promises";
import path from "node:path";

import { getRetentionMs, loadRetentionPolicy } from "../cleanup/retention";

const TRACE_DIRECTORY = path.resolve(
  process.cwd(),
  "..",
  "..",
  "storage",
  "traces",
);

export async function cleanupExpiredTraces() {
  const retention = getRetentionMs(loadRetentionPolicy().traces);

  const files = await fs.readdir(TRACE_DIRECTORY).catch(() => []);

  const now = Date.now();

  let deleted = 0;

  for (const file of files) {
    const full = path.join(TRACE_DIRECTORY, file);

    const stat = await fs.stat(full);

    if (now - stat.mtimeMs <= retention) {
      continue;
    }

    // future support
    if (file.endsWith(".protected.zip")) {
      continue;
    }

    await fs.unlink(full);
    deleted++;
  }

  return deleted;
}
