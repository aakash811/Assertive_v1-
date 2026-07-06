import fs from "node:fs";
import path from "node:path";
import { BatchResult } from "./types";

function queueFile() {
  return path.join(process.cwd(), ".assertive-queue.json");
}

function tempQueueFile() {
  return `${queueFile()}.tmp`;
}

function lockFile() {
  return `${queueFile()}.lock`;
}
const LOCK_TIMEOUT_MS = 30_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquireLock() {
  const start = Date.now();

  while (true) {
    try {
      const fd = fs.openSync(lockFile(), "wx");
      fs.closeSync(fd);
      return;
    } catch {
      if (Date.now() - start > LOCK_TIMEOUT_MS) {
        throw new Error("Timed out waiting for offline queue lock.");
      }

      await sleep(100);
    }
  }
}

function releaseLock() {
  if (fs.existsSync(lockFile())) {
    fs.unlinkSync(lockFile());
  }
}

function isBatchResult(value: unknown): value is BatchResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Partial<BatchResult>;

  return (
    typeof result.externalId === "string" &&
    typeof result.status === "string" &&
    (result.durationMs === undefined || typeof result.durationMs === "number")
  );
}

function isQueueItem(value: unknown): value is QueueItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<QueueItem>;

  return (
    !!item.batch &&
    typeof item.batch.branch === "string" &&
    typeof item.batch.environment === "string" &&
    Array.isArray(item.results) &&
    item.results.every(isBatchResult)
  );
}
export interface QueueItem {
  batch: {
    branch: string;
    environment: string;
  };

  results: BatchResult[];
}

export function loadQueue(): QueueItem[] {
  if (!fs.existsSync(queueFile())) {
    return [];
  }

  try {
    const parsed = JSON.parse(
      fs.readFileSync(queueFile(), "utf-8")
    );

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isQueueItem);
  } catch {
    return [];
  }
}

export function saveQueue(items: QueueItem[]) {
  fs.writeFileSync(
    tempQueueFile(),
    JSON.stringify(items, null, 2),
    "utf-8",
  );

  fs.renameSync(
    tempQueueFile(),
    queueFile(),
  );
}

export function enqueue(item: QueueItem) {
  const queue = loadQueue();

  queue.push(item);
  saveQueue(queue);
}


export async function withQueueLock<T>(
  operation: () => Promise<T>,
): Promise<T> {
  await acquireLock();

  try {
    return await operation();
  } finally {
    releaseLock();
  }
}