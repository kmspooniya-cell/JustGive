import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TrustCenter } from "@/components/trust-center";
import { ReceiptCard } from "@/components/receipt-card";

afterEach(() => { vi.unstubAllGlobals(); });

describe("trust center", () => {
  it("shows the empty state when no verified data exists", () => {
    render(<TrustCenter locale="en" summary={null} />);
    expect(screen.getByText(/Verified contribution statistics will appear/i)).toBeInTheDocument();
    expect(screen.getByText("Where your rupee goes")).toBeInTheDocument();
  });

  it("renders verified figures and the not-claimed list", () => {
    const summary = { gross_paise: 5100, successful_count: 3, refund_paise: 0, gateway_fees_paise: null, net_settlement_paise: null, last_updated: "2026-11-12T00:00:00Z" };
    render(<TrustCenter locale="en" summary={summary} />);
    expect(screen.getByText("₹51")).toBeInTheDocument();
    expect(screen.getByText("What we do not claim")).toBeInTheDocument();
    expect(screen.getByText(/Charitable, NGO, 80G/i)).toBeInTheDocument();
  });
});

describe("receipt card", () => {
  it("renders the amount band, amount, and share actions", () => {
    render(<ReceiptCard amountPaise={5100} causePreference={null} locale="en" shareUrl="/en/receipt?order=x&token=y" />);
    expect(screen.getByText("₹51")).toBeInTheDocument();
    expect(screen.getByText("Download card")).toBeInTheDocument();
    expect(screen.getByText("Copy link")).toBeInTheDocument();
    expect(screen.getByText("Share on WhatsApp")).toBeInTheDocument();
    expect(screen.getByText(/Voluntary · personal · no rewards/i)).toBeInTheDocument();
  });
});