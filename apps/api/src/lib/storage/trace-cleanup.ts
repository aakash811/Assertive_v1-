import { createTraceProvider } from "./storage-factory";

export async function cleanupExpiredTraces() {
  const retentionMs = getRetentionMs();

  if (retentionMs <= 0) {
    return 0;
  }

  const provider = createTraceProvider();

  if (provider.delete) {
    const keys = await provider.list();

    const now = Date.now();

    let deleted = 0;

    for (const key of keys) {
      const traceKey = key.replace(/\.zip$/, "").split("/").pop() ?? key;

      const result = await getTraceCreatedAt(traceKey);

      if (!result || now - result > retentionMs) {
        await provider.delete(traceKey);
        deleted++;
      }
    }

    return deleted;
  }

  return 0;
}

async function getTraceCreatedAt(traceKey: string): Promise<number | null> {
  const createdAt = getTraceCreatedAtFromStorage(traceKey);

  if (createdAt) {
    return createdAt;
  }

  return getTraceCreatedAtFromDatabase(traceKey);
}

function getTraceCreatedAtFromStorage(traceKey: string): number | null {
  return null;
}

async function getTraceCreatedAtFromDatabase(traceKey: string): Promise<number | null> {
  return null;
}

function getRetentionMs(): number {
  const retention = process.env.RETENTION_TRACES ?? "30d";

  const match = retention.match(/^(\d+)([dmy])$/);

  if (!match) {
    return 30 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "m":
      return value * 30 * 24 * 60 * 60 * 1000;
    case "y":
      return value * 365 * 24 * 60 * 60 * 1000;
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
}
