import { describe, it, expect } from "vitest";
import { checkLimit, pruneExpired, clientIp } from "./rate-limit";

const opts = { limit: 3, windowMs: 1000 };

describe("checkLimit", () => {
  it("allows up to the limit within a window, then blocks", () => {
    const store = new Map();
    expect(checkLimit(store, "k", opts, 0).ok).toBe(true); // 1
    expect(checkLimit(store, "k", opts, 0).ok).toBe(true); // 2
    expect(checkLimit(store, "k", opts, 0).ok).toBe(true); // 3
    const blocked = checkLimit(store, "k", opts, 0); // 4
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBe(1); // full window remaining → ceil(1000/1000)
  });

  it("reports remaining time to reset as the window elapses", () => {
    const store = new Map();
    for (let i = 0; i < 3; i++) checkLimit(store, "k", opts, 0);
    expect(checkLimit(store, "k", opts, 400).retryAfterSec).toBe(1); // ceil(600/1000)
    expect(checkLimit(store, "k", opts, 950).retryAfterSec).toBe(1); // ceil(50/1000)
  });

  it("starts a fresh window once the previous one expires", () => {
    const store = new Map();
    for (let i = 0; i < 3; i++) checkLimit(store, "k", opts, 0);
    expect(checkLimit(store, "k", opts, 0).ok).toBe(false);
    expect(checkLimit(store, "k", opts, 1000).ok).toBe(true); // window reset at now >= resetAt
  });

  it("tracks keys independently (per-IP isolation)", () => {
    const store = new Map();
    for (let i = 0; i < 3; i++) checkLimit(store, "ip:a", opts, 0);
    expect(checkLimit(store, "ip:a", opts, 0).ok).toBe(false);
    expect(checkLimit(store, "ip:b", opts, 0).ok).toBe(true); // a different client is unaffected
  });
});

describe("pruneExpired", () => {
  it("removes only expired windows", () => {
    const store = new Map();
    checkLimit(store, "old", opts, 0);
    checkLimit(store, "new", opts, 900);
    pruneExpired(store, 1000);
    expect(store.has("old")).toBe(false); // resetAt 1000, now 1000 → expired
    expect(store.has("new")).toBe(true); // resetAt 1900, still live
  });
});

describe("clientIp", () => {
  const req = (headers: Record<string, string>) =>
    new Request("http://x/api/generate", { method: "POST", headers });

  it("takes the first hop of x-forwarded-for", () => {
    expect(clientIp(req({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }))).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip, then 'unknown'", () => {
    expect(clientIp(req({ "x-real-ip": "198.51.100.9" }))).toBe("198.51.100.9");
    expect(clientIp(req({}))).toBe("unknown");
  });
});
