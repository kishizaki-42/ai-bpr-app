type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();

export function allow(key: string, limit: number, intervalMs: number): boolean {
  const now = Date.now();
  const cap = limit;
  const refillRate = cap / intervalMs; // tokens per ms
  const b = buckets.get(key) || { tokens: cap, updatedAt: now };
  // refill
  const elapsed = Math.max(0, now - b.updatedAt);
  b.tokens = Math.min(cap, b.tokens + elapsed * refillRate);
  b.updatedAt = now;

  if (b.tokens >= 1) {
    b.tokens -= 1;
    buckets.set(key, b);
    return true;
  }
  buckets.set(key, b);
  return false;
}

export function rateLimitGuard(key: string, limit = 60, intervalMs = 60_000) {
  const ok = allow(key, limit, intervalMs);
  return ok;
}
