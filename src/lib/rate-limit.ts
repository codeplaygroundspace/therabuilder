/**
 * Best-effort rate limiting for the generation endpoint, to bound runaway Anthropic spend if
 * the deploy is publicly reachable (there is no auth yet — that's #11 / ADR-0007).
 *
 * ⚠️ In-memory and therefore **per-instance**: on serverless (Vercel) each warm instance keeps
 * its own counters and they reset on cold start, so the real limit under concurrency can exceed
 * the configured one. This is defense-in-depth, NOT the spend guarantee — that must be an
 * Anthropic Console monthly spend cap. A durable, cross-instance limit needs a shared store
 * (e.g. Upstash/Vercel KV), which is an undecided infra choice (ADR-0007) — don't add one here.
 *
 * The meaningful protection is the GLOBAL cap (bounds total generations regardless of source);
 * the per-IP cap is a secondary courtesy and is trivially bypassed by rotating IPs.
 */

export type Limit = { limit: number; windowMs: number };
export type RateLimitResult = { ok: boolean; retryAfterSec: number };

type WindowState = { count: number; resetAt: number };

/**
 * Fixed-window counter. Pure given its `store` and `now`, so it's testable without wall-clock
 * or shared state. Mutates `store` in place (the caller owns the Map's lifetime).
 */
export function checkLimit(
  store: Map<string, WindowState>,
  key: string,
  { limit, windowMs }: Limit,
  now: number,
): RateLimitResult {
  const state = store.get(key);
  if (!state || now >= state.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (state.count < limit) {
    state.count += 1;
    return { ok: true, retryAfterSec: 0 };
  }
  return { ok: false, retryAfterSec: Math.ceil((state.resetAt - now) / 1000) };
}

/** Drop expired windows so a Map keyed by client IP can't grow without bound. */
export function pruneExpired(store: Map<string, WindowState>, now: number): void {
  for (const [key, state] of store) {
    if (now >= state.resetAt) store.delete(key);
  }
}

function numEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// Defaults bound worst-case spend; override per environment. The Console cap is the real safety.
const PER_IP: Limit = { limit: numEnv("GENERATE_RATE_LIMIT_PER_MIN", 5), windowMs: 60_000 };
const GLOBAL: Limit = { limit: numEnv("GENERATE_RATE_LIMIT_PER_DAY", 50), windowMs: 86_400_000 };

const store = new Map<string, WindowState>();

/**
 * Apply the per-IP then global limit for one generation request. Per-IP is checked first so a
 * single hammering client is throttled before it can consume a global slot.
 */
export function enforceGenerateRateLimit(ip: string, now: number = Date.now()): RateLimitResult {
  pruneExpired(store, now);
  const perIp = checkLimit(store, `ip:${ip}`, PER_IP, now);
  if (!perIp.ok) return perIp;
  return checkLimit(store, "global", GLOBAL, now);
}

/** Best-effort client IP from proxy headers (Vercel sets `x-forwarded-for`). */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
