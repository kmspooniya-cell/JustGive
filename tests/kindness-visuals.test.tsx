import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { KindnessVisuals } from "@/components/kindness-visuals";

describe("interactive kindness visualization", () => {
  it("zooms and resets the anonymous Universe while retaining the exact total", () => {
    const { container } = render(<KindnessVisuals count={1} locale="en"/>);
    expect(screen.getByText("1", { selector: "strong" })).toBeInTheDocument();
    expect(container.querySelectorAll(".kindness-star")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByText("125%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pan left" }));
    expect(container.querySelector(".kindness-orbit-scene")).toHaveStyle({ transform: "translate(-18px, 0px) scale(1.25)" });
    fireEvent.click(screen.getByRole("button", { name: "Reset view" }));
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
