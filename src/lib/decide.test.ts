import { describe, it, expect } from "vitest";
import { parseList, splitTeams, sliceAtPointer } from "./decide";

describe("decide", () => {
  it("parses commas and new lines", () => {
    expect(parseList("a, b\nc,,\n d ")).toEqual(["a", "b", "c", "d"]);
  });
  it("splits teams balanced", () => {
    const sizes = splitTeams([1, 2, 3, 4, 5, 6, 7], 3).map((t) => t.length).sort();
    expect(sizes).toEqual([2, 2, 3]);
  });
  it("first slice sits under pointer at rotation -90deg", () => {
    expect(sliceAtPointer(-Math.PI / 2, 4)).toBe(0);
  });
});
