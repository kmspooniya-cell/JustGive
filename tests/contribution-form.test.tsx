import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContributionForm } from "../src/components/contribution-form";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("contribution form", () => {
  it("starts with no amount selected and mood selection never chooses an amount", () => {
    render(<ContributionForm locale="en" />);
    expect(screen.getByRole("button", { name: "Choose an amount to continue" })).toBeDisabled();
    expect(screen.getAllByRole("button", { name: /₹(1|5|10|21|51|101)/ }).every((button) => button.getAttribute("aria-pressed") === "false")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Grateful" }));
    expect(screen.getByRole("status")).toHaveTextContent("A quiet moment of gratitude");
    expect(screen.getByRole("button", { name: "Grateful" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Choose an amount to continue" })).toBeDisabled();
  });

  it("selects a preset and creates the matching server order in paise", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ orderId: "demo_order" }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContributionForm locale="en" />);

    const amount = screen.getByRole("button", { name: "₹51" });
    fireEvent.click(amount);
    expect(amount).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Continue with ₹51" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/en/checkout?order=demo_order&amount=51"));
    expect(fetchMock).toHaveBeenCalledWith("/api/payments/create", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ amountPaise: 5100, locale: "en" }),
    }));
  });

  it("rejects decimal and out-of-range custom amounts before sending a request", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContributionForm locale="en" />);

    fireEvent.change(screen.getByLabelText("Or enter another amount"), { target: { value: "1.5" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue with ₹1.5" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a whole rupee amount");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits an optional anonymous note separately with explicit consent", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContributionForm locale="en" />);

    fireEvent.click(screen.getByText("Leave an optional message"));
    fireEvent.change(screen.getByLabelText("Your optional message"), { target: { value: "A little kindness." } });
    expect(screen.getByRole("button", { name: "Send for review" })).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/I explicitly consent/));
    fireEvent.click(screen.getByRole("button", { name: "Send for review" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("not public yet"));
    expect(fetchMock).toHaveBeenCalledWith("/api/messages", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ message: "A little kindness.", publishConsent: true, locale: "en" }),
    }));
  });
});
