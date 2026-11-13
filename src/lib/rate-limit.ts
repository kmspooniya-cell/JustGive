const buckets = new Map<string, { count: number; resetAt: number }>();
/** In-memory development fallback only; use a shared Redis-compatible service in production. */
export async function allowRequest(key: string, limit = 5, windowMs = 60_000) {
  if (process.env.NODE_ENV === "production") {
    // A shared unknown-IP bucket lets one request source exhaust everyone’s quota.
    if (key.endsWith(":unknown")) return false;
    const url=process.env.RATE_LIMIT_REDIS_URL; const token=process.env.RATE_LIMIT_REDIS_TOKEN;
    if(!url||!token)return false;
    try {
      const script="local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[2]); end; return n <= tonumber(ARGV[1])";
      const response=await fetch(url,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify(["EVAL",script,"1",`justgive:${key}`,String(limit),String(windowMs)]),cache:"no-store"});
      if(!response.ok)return false; const result=await response.json() as {result?:number|boolean}; return result.result===1||result.result===true;
    } catch { return false; }
  }
  const now = Date.now(); const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  if (bucket.count >= limit) return false;
  bucket.count += 1; return true;
}
