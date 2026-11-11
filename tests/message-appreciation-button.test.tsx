import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessageAppreciationButton } from "../src/components/message-appreciation-button";

afterEach(() => vi.unstubAllGlobals());

describe("message appreciation", () => {
  it("saves once and updates the aggregate count", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: 6 }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<MessageAppreciationButton id="message-id" count={5} locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Appreciate, 5" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Appreciated, 6" })).toBeDisabled());
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the action available after a server failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    render(<MessageAppreciationButton id="message-id" count={0} locale="hi" />);
    fireEvent.click(screen.getByRole("button", { name: "सराहें, 0" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("अभी सराहना दर्ज नहीं हो सकी"));
    expect(screen.getByRole("button", { name: "सराहें, 0" })).toBeEnabled();
  });
});
