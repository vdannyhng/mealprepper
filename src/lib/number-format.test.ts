import { describe, expect, it } from "vitest";
import { formatNumber } from "./number-format";

describe("formatNumber", () => {
  it("groups thousands with the Swiss apostrophe", () => {
    expect(formatNumber(2370)).toBe("2’370");
    expect(formatNumber(1234567)).toBe("1’234’567");
    expect(formatNumber(999)).toBe("999");
  });

  it("rounds and trims trailing zeros", () => {
    expect(formatNumber(2369.6)).toBe("2’370");
    expect(formatNumber(3.6, 1)).toBe("3.6");
    expect(formatNumber(4, 2)).toBe("4");
    expect(formatNumber(1.005, 2)).toBe("1.01");
  });

  it("handles negatives, zero and invalid input", () => {
    expect(formatNumber(-1500)).toBe("-1’500");
    expect(formatNumber(-0.01)).toBe("0");
    expect(formatNumber(Number.NaN)).toBe("–");
  });
});
