import { z } from "zod";

const count = z.string().regex(/^\d+$/);
const paise = z.string().regex(/^-?\d+$/);

export const adminFinancialSummarySchema = z.object({
  payment_record_count: count,
  verified_payment_count: count,
  gross_paise: count,
  average_paise: count,
  pending_payment_count: count,
  failed_payment_count: count,
  successful_refund_count: count,
  refund_paise: count,
  net_contribution_paise: paise,
  settlement_row_count: count,
  settlement_fee_paise: paise.nullable(),
  settlement_net_paise: paise.nullable(),
  undated_successful_refund_count: count,
  unverified_refunded_payment_count: count,
  incomplete_settlement_count: count,
  undated_settlement_count: count,
  unreconciled_payment_count: count,
});

export type AdminFinancialSummary = z.infer<typeof adminFinancialSummarySchema>;

export function formatPaise(value: string | null) {
  if (value === null) return null;
  const amount = BigInt(value);
  const sign = amount < 0n ? "−" : "";
  const absolute = amount < 0n ? -amount : amount;
  const rupees = (absolute / 100n).toLocaleString("en-IN");
  const remainder = String(absolute % 100n).padStart(2, "0");
  return `${sign}₹${rupees}.${remainder}`;
}

export function formatCount(value: string) {
  return BigInt(value).toLocaleString("en-IN");
}

export function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  const startsLikeFormula = /^[=+@\t\r]/.test(text) || /^-\D/.test(text);
  return `"${(startsLikeFormula ? `'${text}` : text).replaceAll('"', '""')}"`;
}

export function hasPartialFinancialData(summary: AdminFinancialSummary) {
  return [
    summary.undated_successful_refund_count,
    summary.unverified_refunded_payment_count,
    summary.incomplete_settlement_count,
    summary.undated_settlement_count,
    summary.unreconciled_payment_count,
  ].some((value) => BigInt(value) > 0n);
}
