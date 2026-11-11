import { describe, expect, it } from "vitest";
import { messageRiskFlags, moderationPageBounds } from "@/lib/moderation";

describe("moderation helpers", () => {
  it("flags links and text patterns as advisory review cues", () => {
    expect(messageRiskFlags("Visit https://example.test noooooooo")).toEqual(["contains-link", "repeated-characters"]);
    expect(messageRiskFlags("THIS IS A LOUD SHOUTING MESSAGE")).toContain("mostly-uppercase");
  });
  it("does not flag ordinary writing", () => {
    expect(messageRiskFlags("Thank you for making my day brighter.")).toEqual([]);
  });
  it("bounds wall pagination and returns zero-based ranges", () => {
    expect(moderationPageBounds(2)).toEqual({ page: 2, from: 20, to: 40 });
    expect(moderationPageBounds(-3)).toEqual({ page: 1, from: 0, to: 20 });
    expect(moderationPageBounds(Number.POSITIVE_INFINITY)).toEqual({ page: 1, from: 0, to: 20 });
  });
});
