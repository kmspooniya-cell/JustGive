import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { MobileNav } from "@/components/mobile-nav";
import { SkipLink } from "@/components/skip-link";

vi.mock("next/navigation", () => ({ usePathname: () => "/en" }));

describe("mobile navigation", () => {
  it("closes on Escape and returns focus to the trigger", () => {
    render(<MobileNav locale="en" nav={<span>About</span>} giveLabel="Give" />);
    const details = document.querySelector("details.mobile-nav") as HTMLDetailsElement;
    const summary = details.querySelector("summary") as HTMLElement;

    fireEvent.click(summary);
    expect(details.open).toBe(true);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(details.open).toBe(false);
    expect(summary).toHaveFocus();
  });

  it("closes when a pointer goes down outside", () => {
    render(<MobileNav locale="en" nav={<span>About</span>} giveLabel="Give" />);
    const details = document.querySelector("details.mobile-nav") as HTMLDetailsElement;
    fireEvent.click(details.querySelector("summary") as HTMLElement);
    expect(details.open).toBe(true);

    fireEvent.pointerDown(document.body);
    expect(details.open).toBe(false);
  });
});

describe("skip link", () => {
  it("moves focus to the main landmark", () => {
    const { container } = render(
      <>
        <SkipLink label="Skip to main content" />
        <main>
          <h1>Page</h1>
        </main>
      </>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Skip to main content" }));

    const main = container.querySelector("main");
    expect(main).toHaveFocus();
    expect(main).toHaveAttribute("tabindex", "-1");
  });
});