import "server-only";
import { env } from "@/lib/env";

type Result = { success: boolean; remaining: number; limit: number };

// In-memory fallback store (per-instance). Fine for a single server / demo.
const buckets = new Map<string, number[]>();

async function upstashLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<Result | null> {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;
  try {
    const now = Date.now();
    const member = `${now}-${Math.random()}`;
    const windowStart = now - windowMs;
    // Use a sorted set per key: remove old, add current, count, expire.
    const pipeline = [
      ["ZREMRANGEBYSCORE", key, "0", String(windowStart)],
      ["ZADD", key, String(now), member],
      ["ZCARD", key],
      ["PEXPIRE", key, String(windowMs)],
    ];
    const res = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result: unknown }[];
    const count = Number(data[2]?.result ?? 0);
    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      limit,
    };
  } catch {
    return null;
  }
}

function memoryLimit(key: string, limit: number, windowMs: number): Result {
  const now = Date.now();
  const windowStart = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > windowStart);
  hits.push(now);
  buckets.set(key, hits);
  return {
    success: hits.length <= limit,
    remaining: Math.max(0, limit - hits.length),
    limit,
  };
}

/**
 * Rate limits an action by key. Uses Upstash Redis when configured, otherwise
 * an in-memory sliding window.
 */
export async function rateLimit(
  key: string,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): Promise<Result> {
  const upstash = await upstashLimit(key, limit, windowMs);
  return upstash ?? memoryLimit(key, limit, windowMs);
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
