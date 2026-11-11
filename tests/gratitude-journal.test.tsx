import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GratitudeJournal } from "@/components/gratitude-journal";

afterEach(() => vi.unstubAllGlobals());
describe("private Gratitude Journal UI", () => {
  it("loads entries and submits them through the protected API", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ entries: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ entry: { id: "a", body: "A quiet morning", created_at: "2026-11-11T00:00:00Z", updated_at: "2026-11-11T00:00:00Z" } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ entries: [{ id: "a", body: "A quiet morning", created_at: "2026-11-11T00:00:00Z", updated_at: "2026-11-11T00:00:00Z" }] }) })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ entries: [{ id: "a", body: "A quiet morning outdoors", created_at: "2026-11-11T00:00:00Z", updated_at: "2026-11-11T00:01:00Z" }] }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<GratitudeJournal locale="en"/>);
    const field = await screen.findByLabelText("A moment you feel grateful for");
    fireEvent.change(field, { target: { value: "A quiet morning" } });
    fireEvent.click(screen.getByRole("button", { name: "Save private entry" }));
    expect(await screen.findByText("A quiet morning")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/journal", expect.objectContaining({ method: "POST" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Private entry saved."));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Edit entry"), { target: { value: "A quiet morning outdoors" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(5));
    expect(await screen.findByText("A quiet morning outdoors")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(4, "/api/admin/journal", expect.objectContaining({ method: "PATCH", body: JSON.stringify({ id: "a", body: "A quiet morning outdoors" }) }));
  });
});
