import fs from "node:fs";
import path from "node:path";

const QUEUE_FILE = path.join(process.cwd(), ".assertive-queue.json");

export interface BatchResult {
  uniqueId: string;
  status: string;
  durationMs: number;
  errorMessage?: string;
  traceUrl?: string | null;
}
export interface QueueItem {
  batch: {
    branch: string;
    environment: string;
  };

  results: BatchResult[];
}

export function loadQueue(): QueueItem[] {
  if (!fs.existsSync(QUEUE_FILE)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(QUEUE_FILE, "utf-8"));
}

export function saveQueue(items: QueueItem[]) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export function enqueue(item: QueueItem) {
  const queue = loadQueue();

  queue.push(item);
  saveQueue(queue);
}
