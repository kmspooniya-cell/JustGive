import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { KindnessTree, KindnessVisuals } from "@/components/kindness-visuals";

describe("interactive kindness visualizations", () => {
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

  it("animates one tree leaf per contribution up to its documented rendering limit", () => {
    const { container, rerender } = render(<KindnessTree count={2} locale="en"/>);
    expect(container.querySelectorAll(".tree-leaf")).toHaveLength(2);
    rerender(<KindnessTree count={241} locale="en"/>);
    expect(container.querySelectorAll(".tree-leaf")).toHaveLength(240);
    expect(screen.getByText("The tree is symbolic; the total remains exact.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pan tree right" }));
    expect(container.querySelector(".kindness-tree-art g")?.getAttribute("transform")).toContain("translate(12 0)");
  });
});
