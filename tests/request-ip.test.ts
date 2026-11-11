import { describe, expect, it } from "vitest";
import { getRequestIp } from "../src/lib/request-ip";

describe("trusted request address", () => {
  it("ignores client-controlled forwarding chains", () => {
    const request = new Request("https://example.test", { headers: { "x-forwarded-for": "203.0.113.8" } });
    expect(getRequestIp(request)).toBe("unknown");
  });

  it("uses the address header supplied by the hosting proxy", () => {
    const request = new Request("https://example.test", { headers: { "x-real-ip": "203.0.113.9", "x-forwarded-for": "203.0.113.8" } });
    expect(getRequestIp(request)).toBe("203.0.113.9");
  });
});
