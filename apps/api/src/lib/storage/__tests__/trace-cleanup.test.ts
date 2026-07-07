import fs from "node:fs/promises";
import syncFs from "node:fs";
import path from "node:path";
import os from "node:os";

import { beforeEach, afterEach, describe, expect, it } from "vitest";

import { cleanupExpiredTraces } from "../trace-cleanup";

describe("trace cleanup", () => {
  let cwd: string;
  let tempDir: string;

  beforeEach(async () => {
    cwd = process.cwd();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "trace-cleanup-"));
    await fs.mkdir(path.join(tempDir, "apps", "api"), { recursive: true });
    process.chdir(path.join(tempDir, "apps", "api"));
  });

  afterEach(() => {
    process.chdir(cwd);
    delete process.env.RETENTION_TRACES;
  });

  it("does not throw when directory is missing", async () => {
    await expect(cleanupExpiredTraces()).resolves.not.toThrow();
  });

  it("does not delete protected traces", async () => {
    const tracesDir = path.resolve(
      process.cwd(),
      "..",
      "..",
      "storage",
      "traces",
    );

    await fs.mkdir(tracesDir, {
      recursive: true,
    });

    const protectedTrace = path.join(tracesDir, "keep.protected.zip");
    syncFs.writeFileSync(protectedTrace, "trace");

    const old = Date.now() - 40 * 24 * 60 * 60 * 1000;
    syncFs.utimesSync(protectedTrace, old / 1000, old / 1000);

    process.env.RETENTION_TRACES = "30d";
    await cleanupExpiredTraces();
    expect(syncFs.existsSync(protectedTrace)).toBe(true);
  });
});
