import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import { beforeEach, afterEach, describe, expect, it } from "vitest";

import { cleanupExpiredTraces } from "../trace-cleanup";

describe("trace cleanup", () => {
  let cwd: string;

  beforeEach(async () => {
    cwd = process.cwd();

    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "trace-cleanup-"));

    process.chdir(dir);
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  it("does not throw when directory is missing", async () => {
    await expect(cleanupExpiredTraces()).resolves.not.toThrow();
  });
});
