import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccessibilityTools } from "@/components/accessibility-tools";

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); document.documentElement.className = ""; });
describe("accessibility and ambient controls", () => {
  it("offers persistent text, contrast and motion preferences", async () => {
    render(<AccessibilityTools locale="en"/>);
    fireEvent.click(screen.getByLabelText("Accessibility options"));
    fireEvent.click(screen.getByLabelText("Larger text"));
    fireEvent.click(screen.getByLabelText("Higher contrast"));
    fireEvent.click(screen.getByLabelText("Reduce motion"));
    expect(document.documentElement).toHaveClass("a11y-large-text", "a11y-high-contrast", "a11y-reduced-motion");
    expect(JSON.parse(localStorage.getItem("justgive-a11y")!)).toEqual({ largeText: true, highContrast: true, reducedMotion: true });
  });

  it("does not create audio until the visitor opts in and stops it on request", () => {
    const starts = vi.fn(), stops = vi.fn(), close = vi.fn();
    class FakeAudioContext {
      destination = {};
      createGain() { return { gain: { value: 0 }, connect: vi.fn() }; }
      createOscillator() { return { type: "sine", frequency: { value: 0 }, detune: { value: 0 }, connect: vi.fn(), start: starts, stop: stops }; }
      close = close;
    }
    vi.stubGlobal("AudioContext", FakeAudioContext);
    render(<AccessibilityTools locale="en"/>);
    expect(starts).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Turn on gentle ambient sound" }));
    expect(starts).toHaveBeenCalledTimes(3);
    fireEvent.click(screen.getByRole("button", { name: "Turn off gentle ambient sound" }));
    expect(stops).toHaveBeenCalledTimes(3);
    expect(close).toHaveBeenCalled();
  });
});
