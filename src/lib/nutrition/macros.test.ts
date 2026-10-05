import { describe, expect, it } from "vitest";
import {
  calorieMacroMismatch,
  energyFromMacros,
  macroEnergySplit,
  roundTo,
  scaleMacros,
  sumMacros,
} from "./macros";

describe("roundTo", () => {
  it("removes floating point noise", () => {
    expect(roundTo(0.1 + 0.2)).toBe(0.3);
    expect(roundTo(165 * 2.5)).toBe(412.5);
    expect(roundTo(1.005, 2)).toBe(1.01);
  });
});

describe("energyFromMacros", () => {
  it("applies 4/4/9 kcal per gram", () => {
    expect(energyFromMacros({ protein: 180, carbs: 260, fat: 70 })).toBe(2390);
  });
});

describe("sumMacros", () => {
  it("adds up macros without floating point drift", () => {
    const total = sumMacros([
      { calories: 0.1, protein: 0.2, carbs: 0.3, fat: 0.1 },
      { calories: 0.2, protein: 0.1, carbs: 0.3, fat: 0.2 },
    ]);
    expect(total).toEqual({ calories: 0.3, protein: 0.3, carbs: 0.6, fat: 0.3 });
  });

  it("returns zeros for an empty list", () => {
    expect(sumMacros([])).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe("scaleMacros", () => {
  it("scales per-portion values", () => {
    expect(scaleMacros({ calories: 2800, protein: 240, carbs: 300, fat: 80 }, 1 / 4)).toEqual({
      calories: 700,
      protein: 60,
      carbs: 75,
      fat: 20,
    });
  });
});

describe("calorieMacroMismatch", () => {
  it("is small for consistent targets", () => {
    expect(
      calorieMacroMismatch({ calories: 2400, protein: 180, carbs: 260, fat: 70 }),
    ).toBeLessThan(0.01);
  });

  it("detects inconsistent targets", () => {
    expect(
      calorieMacroMismatch({ calories: 1500, protein: 180, carbs: 260, fat: 70 }),
    ).toBeGreaterThan(0.5);
  });
});

describe("macroEnergySplit", () => {
  it("returns energy shares in percent", () => {
    expect(macroEnergySplit({ protein: 100, carbs: 100, fat: 0 })).toEqual({
      protein: 50,
      carbs: 50,
      fat: 0,
    });
  });
});
