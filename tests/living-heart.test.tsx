import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnimatedHeart } from "@/components/animated-heart";
import { CheckoutActions } from "@/components/checkout-actions";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe("living heart", () => {
  it("plays on activation and offers a keyboard-operable control", () => {
    const { container } = render(<AnimatedHeart locale="en" />);
    const heart = screen.getByRole("button", { name: "Give the heart a gentle pulse" });

    fireEvent.keyDown(heart, { key: "Enter" });
    expect(container.querySelector(".hero-art")).toHaveClass("is-celebrating");
  });

  it("celebrates only after the server confirms a successful simulated payment", async () => {
    let resolvePayment: ((value: { ok: boolean; json: () => Promise<{ status: string; simulated: boolean }> }) => void) | undefined;
    vi.stubGlobal("fetch", vi.fn(() => new Promise((resolve) => { resolvePayment = resolve; })));
    render(<CheckoutActions order="jg_123" amount={21} locale="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Simulate payment" }));
    expect(sessionStorage.getItem("justgive:contribution-confirmed")).toBeNull();

    resolvePayment?.({ ok: true, json: async () => ({ status: "successful", simulated: true, receiptToken: "tok-1" }) });
    await waitFor(() => expect(sessionStorage.getItem("justgive:contribution-confirmed")).toBe("1"));
    expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/en\/payment-status\?state=successful&simulated=1&order=jg_123&token=/));

    const { container } = render(<AnimatedHeart locale="en" />);
    await waitFor(() => expect(container.querySelector(".hero-art")).toHaveClass("is-celebrating"));
    expect(sessionStorage.getItem("justgive:contribution-confirmed")).toBeNull();
  });

  it("does not celebrate pending, failed, or non-simulated responses", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "pending", simulated: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "successful", simulated: false }) });
    vi.stubGlobal("fetch", fetchMock);
    const { unmount } = render(<CheckoutActions order="jg_123" amount={21} locale="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Simulate payment" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/en\/payment-status\?state=pending&simulated=1&order=jg_123$/)));
    expect(sessionStorage.getItem("justgive:contribution-confirmed")).toBeNull();

    unmount();
    render(<CheckoutActions order="jg_123" amount={21} locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Simulate payment" }));
    await waitFor(() => expect(push).toHaveBeenLastCalledWith(expect.stringMatching(/^\/en\/payment-status\?state=successful&simulated=1&order=jg_123$/)));
    expect(sessionStorage.getItem("justgive:contribution-confirmed")).toBeNull();
  });
});
