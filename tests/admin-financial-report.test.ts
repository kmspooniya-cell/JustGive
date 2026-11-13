import { describe, expect, it } from "vitest";
import {
  adminFinancialSummarySchema,
  csvCell,
  formatPaise,
  hasPartialFinancialData,
} from "../src/lib/admin-financial-report";

const summary = {
  payment_record_count: "10",
  verified_payment_count: "5",
  gross_paise: "123456789012345",
  average_paise: "24691357802469",
  pending_payment_count: "2",
  failed_payment_count: "3",
  successful_refund_count: "1",
  refund_paise: "100",
  net_contribution_paise: "123456789012245",
  settlement_row_count: "1",
  settlement_fee_paise: "10",
  settlement_net_paise: "123456789012335",
  undated_successful_refund_count: "0",
  unverified_refunded_payment_count: "0",
  incomplete_settlement_count: "0",
  undated_settlement_count: "0",
  unreconciled_payment_count: "0",
};

describe("admin financial summaries", () => {
  it("formats paise exactly without converting large values to floating point", () => {
    expect(formatPaise("123456789012345")).toBe("₹12,34,56,78,90,123.45");
    expect(formatPaise("-101")).toBe("−₹1.01");
    expect(formatPaise(null)).toBeNull();
  });

  it("rejects malformed aggregate values instead of displaying them as zero", () => {
    expect(adminFinancialSummarySchema.safeParse(summary).success).toBe(true);
    expect(adminFinancialSummarySchema.safeParse({ ...summary, gross_paise: "12.5" }).success).toBe(false);
  });

  it("reports incomplete timestamps and settlement data as partial", () => {
    expect(hasPartialFinancialData(adminFinancialSummarySchema.parse(summary))).toBe(false);
    expect(hasPartialFinancialData(adminFinancialSummarySchema.parse({
      ...summary,
      undated_successful_refund_count: "1",
    }))).toBe(true);
  });

  it("quotes CSV cells and neutralizes spreadsheet formulas", () => {
    expect(csvCell('a"b')).toBe('"a""b"');
    expect(csvCell(null)).toBe('""');
    expect(csvCell("=1+1")).toBe('"\'=1+1"');
    expect(csvCell("+1")).toBe('"\'+1"');
    expect(csvCell("@SUM(A1)")).toBe('"\'@SUM(A1)"');
    expect(csvCell("-2")).toBe('"-2"');
  });
});
