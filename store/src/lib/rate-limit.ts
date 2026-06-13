import { RATE_LIMIT } from "@/config/store";

/**
 * Minimal in-memory, per-IP fixed-window rate limiter.
 *
 * Good enough for a single-instance deployment and for protecting the
 * payment-creation route from spam. For multi-instance / serverless at scale,
 * swap the Map for the same KV store used in store-kv.ts (noted in README).
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string): {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
} {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { ok: true, remaining: RATE_LIMIT.maxRequests - 1, retryAfterSec: 0 };
  }

  if (entry.count >= RATE_LIMIT.maxRequests) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    ok: true,
    remaining: RATE_LIMIT.maxRequests - entry.count,
    retryAfterSec: 0,
  };
}

/** Best-effort client IP from common proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
