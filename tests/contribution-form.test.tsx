import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContributionForm } from "../src/components/contribution-form";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});

describe("contribution form", () => {
  it("discloses the recipient and cause preference before the contribution action in both locales", () => {
    const { rerender } = render(<ContributionForm locale="en" />);
    const assertDisclosuresPrecedeAction = (recipient: string, causeDisclosure: string, action: string) => {
      const primaryAction = screen.getByRole("button", { name: action });
      expect(screen.getByText(recipient).compareDocumentPosition(primaryAction)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(screen.getByText(causeDisclosure).compareDocumentPosition(primaryAction)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    };

    assertDisclosuresPrecedeAction(
      "Your voluntary contribution goes to the JustGive website owner personally. JustGive is not a charity or NGO.",
      "A cause preference shares what matters to you; it does not allocate or direct your contribution.",
      "Choose an amount to continue",
    );

    rerender(<ContributionForm locale="hi" />);
    assertDisclosuresPrecedeAction(
      "आपका स्वैच्छिक योगदान JustGive वेबसाइट के मालिक को व्यक्तिगत रूप से मिलेगा। JustGive कोई चैरिटी या NGO नहीं है।",
      "उद्देश्य की आपकी पसंद आपकी प्राथमिकता बताती है; इससे आपका योगदान उस उद्देश्य के लिए आवंटित या निर्देशित नहीं होता।",
      "आगे बढ़ने के लिए राशि चुनें",
    );
  });

  it("starts with no amount selected", () => {
    render(<ContributionForm locale="en" />);
    expect(screen.getByRole("button", { name: "Choose an amount to continue" })).toBeDisabled();
    expect(screen.getAllByRole("button", { name: /₹(1|5|10|21|51|101)/ }).every((button) => button.getAttribute("aria-pressed") === "false")).toBe(true);

    expect(screen.queryByRole("group", { name: "How are you feeling today? (optional)" })).not.toBeInTheDocument();
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
      body: JSON.stringify({ amountPaise: 5100, locale: "en", causePreference: null }),
    }));
  });

  it("opens the English cause popup, selects one cause, and keeps the choice on reopen", async () => {
    render(<ContributionForm locale="en" />);
    const labels = ["Education", "Healthcare", "Animal welfare", "Other causes", "No preference"];
    expect(screen.queryByRole("button", { name: "Education" })).not.toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: "Choose a cause" });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Choose a cause" })).toBeInTheDocument();
    expect(screen.getByText("Choose what matters to you. You can skip this step.")).toBeInTheDocument();
    let options = labels.map(label => screen.getByRole("button", { name: label }));
    expect(options.every(option => option.getAttribute("aria-pressed") === "false")).toBe(true);
    fireEvent.click(options[0]);
    expect(options[0]).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(options[1]);
    expect(options[0]).toHaveAttribute("aria-pressed", "false");
    expect(options[1]).toHaveAttribute("aria-pressed", "true");
    for (const option of options.slice(2)) {
      fireEvent.click(option);
      expect(option).toHaveAttribute("aria-pressed", "true");
      expect(options.filter(item => item.getAttribute("aria-pressed") === "true")).toHaveLength(1);
    }
    fireEvent.click(options[1]);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Healthcare" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Healthcare" }));
    options = labels.map(label => within(screen.getByRole("dialog")).getByRole("button", { name: label }));
    expect(options[1]).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(options[1]).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(options[0]);
    fireEvent.click(options[0]);
    expect(options[0]).toHaveAttribute("aria-pressed", "false");
  });

  it("supports close button, outside click and Escape, with Hindi labels", async () => {
    render(<ContributionForm locale="hi" />);
    fireEvent.click(screen.getByRole("button", { name: "उद्देश्य चुनें" }));
    expect(screen.getByText("जो आपके लिए मायने रखता है, उसे चुनें। चाहें तो यह कदम छोड़ सकते हैं।")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "शिक्षा" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "स्वास्थ्य सेवा" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "पशु कल्याण" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "अन्य उद्देश्य" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "कोई प्राथमिकता नहीं" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "उद्देश्य विकल्प बंद करें" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "उद्देश्य चुनें" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "उद्देश्य चुनें" }));
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("submits without a cause or with the selected preference", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ orderId: "demo_order" }) });
    vi.stubGlobal("fetch", fetchMock);
    const { unmount } = render(<ContributionForm locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "₹5" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue with ₹5" }));
    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith("/api/payments/create", expect.objectContaining({ body: JSON.stringify({ amountPaise: 500, locale: "en", causePreference: null }) })));
    unmount();
    render(<ContributionForm locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "₹10" }));
    fireEvent.click(screen.getByRole("button", { name: "Choose a cause" }));
    fireEvent.click(screen.getByRole("button", { name: "Animal welfare" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue with ₹10" }));
    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith("/api/payments/create", expect.objectContaining({ body: JSON.stringify({ amountPaise: 1000, locale: "en", causePreference: "animalWelfare" }) })));
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
