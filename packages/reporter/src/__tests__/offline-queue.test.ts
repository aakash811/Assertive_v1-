import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  enqueue,
  loadQueue,
  saveQueue,
  type QueueItem,
} from "../offline-queue";

const cwd = process.cwd();

describe("offlineQueue", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "assertive-queue-"),
    );

    process.chdir(tempDir);

    fs.rmSync(".assertive-queue.json", {
        force: true,
    });

    fs.rmSync(".assertive-queue.json.tmp", {
        force: true,
    });

    fs.rmSync(".assertive-queue.json.lock", {
        force: true,
    });
  });

  afterEach(() => {
    process.chdir(cwd);

    fs.rmSync(tempDir, {
      recursive: true,
      force: true,
    });
  });

  const item: QueueItem = {
    batch: {
      branch: "main",
      environment: "test",
    },
    results: [
      {
        externalId: "auth.login",
        status: "PASSED",
        durationMs: 100,
      },
    ],
  };

  it("returns empty queue when file does not exist", () => {
    expect(loadQueue()).toEqual([]);
  });

  it("returns empty queue for invalid json", () => {
    fs.writeFileSync(
      ".assertive-queue.json",
      "{invalid json",
    );

    expect(loadQueue()).toEqual([]);
  });

  it("filters malformed queue items", () => {
    fs.writeFileSync(
    ".assertive-queue.json",
    JSON.stringify([
        {},
        { hello: "world" },
        {
        batch: {
            branch: "main",
            environment: "test",
        },
        results: [
            {
            externalId: "auth.login",
            status: "PASSED",
            durationMs: 100,
            },
        ],
        },
    ]),
    );

    expect(loadQueue()).toHaveLength(1);
    expect(loadQueue()[0].batch.branch).toBe("main");

    expect(loadQueue()).toEqual([item]);
  });

  it("saves queue", () => {
    saveQueue([item]);

    expect(loadQueue()).toEqual([item]);
  });

  it("enqueue appends items", () => {
    expect(loadQueue()).toEqual([]);
    
    enqueue(item);
    enqueue(item);

    expect(loadQueue()).toHaveLength(2);
  });
});