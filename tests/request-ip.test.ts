import { afterEach, describe, expect, it, vi } from "vitest";
import { getRequestIp } from "../src/lib/request-ip";
import { allowRequest } from "../src/lib/rate-limit";

afterEach(() => vi.unstubAllEnvs());

describe("trusted request address", () => {
  it("ignores client-controlled forwarding chains", () => {
    const request = new Request("https://example.test", { headers: { "x-forwarded-for": "203.0.113.8" } });
    expect(getRequestIp(request)).toBe("unknown");
  });

  it("uses the address header supplied by the hosting proxy", () => {
    const request = new Request("https://example.test", { headers: { "x-real-ip": "203.0.113.9", "x-forwarded-for": "203.0.113.8" } });
    expect(getRequestIp(request)).toBe("203.0.113.9");
  });

  it("rejects malformed and multi-address proxy headers", () => {
    for (const value of ["not-an-ip", "203.0.113.9, 203.0.113.10", "203.0.113.9:443"]) {
      const request = new Request("https://example.test", { headers: { "x-real-ip": value } });
      expect(getRequestIp(request)).toBe("unknown");
    }
  });

  it("fails closed instead of sharing a production quota for unknown addresses", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(await allowRequest("contact:unknown")).toBe(false);
  });
});
