/**
 * Lightweight sliding-window rate limiter using in-memory Map.
 * Works per Vercel instance — good for abuse prevention, not distributed fairness.
 * For truly distributed limiting, swap this for @upstash/ratelimit + Redis.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean stale keys every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (!entry.timestamps.some((t) => now - t < 60_000)) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check and record a rate-limited hit.
 * @param key      Unique key (e.g. userId, IP)
 * @param limit    Max requests in window
 * @param windowMs Time window in milliseconds
 * @returns { allowed, remaining, resetMs }
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  // Prune timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  const remaining = Math.max(0, limit - entry.timestamps.length);
  const resetMs = entry.timestamps.length > 0
    ? windowMs - (now - entry.timestamps[0])
    : 0;

  if (entry.timestamps.length >= limit) {
    store.set(key, entry);
    return { allowed: false, remaining: 0, resetMs };
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  return { allowed: true, remaining: remaining - 1, resetMs };
}

/** Helper: return a 429 Response with Retry-After header */
export function rateLimitResponse(resetMs: number): Response {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please slow down.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(resetMs / 1000)),
        'X-RateLimit-Limit': '0',
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}
