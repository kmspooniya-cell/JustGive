import { describe, expect, it } from "vitest";
import {
  adminDateQuery,
  paymentDateFilter,
  refundDateFilter,
  resolveAdminDateRange,
} from "../src/lib/date-range";

describe("admin financial date ranges", () => {
  it("uses inclusive Asia/Kolkata calendar dates with an exclusive upper bound", () => {
    expect(resolveAdminDateRange({ from: "2026-01-02", to: "2026-01-02" })).toMatchObject({
      startAt: "2026-01-01T18:30:00.000Z",
      endBefore: "2026-01-02T18:30:00.000Z",
    });
  });

  it("rejects malformed, impossible, and reversed dates", () => {
    expect(resolveAdminDateRange({ from: "2026-02-30" }).error).toBe("invalid");
    expect(resolveAdminDateRange({ to: "tomorrow" }).error).toBe("invalid");
    expect(resolveAdminDateRange({ from: "0999-01-01" }).error).toBe("invalid");
    expect(resolveAdminDateRange({ from: ["2026-01-01", "2026-01-02"] }).error).toBe("invalid");
    expect(resolveAdminDateRange({ from: "2026-02-02", to: "2026-02-01" }).error).toBe("reversed");
  });

  it("keeps the existing rolling period shortcuts", () => {
    const now = new Date("2026-01-08T12:00:00.000Z");
    expect(resolveAdminDateRange({ period: "week" }, now)).toMatchObject({
      startAt: "2026-01-01T12:00:00.000Z",
      endBefore: "2026-01-08T12:00:00.000Z",
    });
  });

  it("starts the day shortcut at IST midnight", () => {
    const now = new Date("2026-01-08T00:15:00.000Z");
    expect(resolveAdminDateRange({ period: "day" }, now)).toMatchObject({
      startAt: "2026-01-07T18:30:00.000Z",
      endBefore: "2026-01-08T00:15:00.000Z",
    });
  });

  it("filters paid events and refunds by their event timestamps", () => {
    const range = resolveAdminDateRange({ from: "2026-01-02", to: "2026-01-02" });
    expect(paymentDateFilter(range)).toContain("verified_paid_at.gte.2026-01-01T18:30:00.000Z");
    expect(paymentDateFilter(range)).toContain("created_at.lt.2026-01-02T18:30:00.000Z");
    expect(refundDateFilter(range)).toContain("completed_at.gte.2026-01-01T18:30:00.000Z");
    expect(refundDateFilter(range)).toContain("created_at.lt.2026-01-02T18:30:00.000Z");
  });

  it("preserves filters in pagination links", () => {
    expect(adminDateQuery({ from: "2026-01-01", to: "2026-01-08" }, 2)).toBe(
      "from=2026-01-01&to=2026-01-08&page=2",
    );
    expect(adminDateQuery({ period: "month" })).toBe("period=month");
    expect(adminDateQuery({ period: "day", from: "", to: "" })).toBe("period=day");
  });
});
