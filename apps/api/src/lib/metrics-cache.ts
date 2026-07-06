type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

const TTL_MS = 30_000;

export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);

  if (!entry) {
    return undefined;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }

  return entry.value as T;
}

export function setCached<T>(key: string, value: T) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + TTL_MS,
  });
}

export function clearMetricsCache() {
  cache.clear();
}
