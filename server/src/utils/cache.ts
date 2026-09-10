type CacheEntry = {
  value: unknown;
  createdAt: number;
  ttlMs: number;
};

const cache = new Map<string, CacheEntry>();

export function setCacheValue(key: string, value: unknown, ttlMs = 60_000): void {
  cache.set(key, { value, createdAt: Date.now(), ttlMs });
}

export function getCacheValue<T = unknown>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.createdAt > entry.ttlMs) {
    cache.delete(key);
    return null;
  }

  return entry.value as T;
}

export function deleteCacheValue(key: string): void {
  cache.delete(key);
}
