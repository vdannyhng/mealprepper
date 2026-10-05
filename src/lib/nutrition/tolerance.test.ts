import { describe, expect, it } from "vitest";
import {
  evaluateMacros,
  isWithinTargets,
  macroStatus,
  progressPercent,
  targetRange,
} from "./tolerance";

const target = { calories: 2400, protein: 180, carbs: 260, fat: 70 };

describe("targetRange", () => {
  it("uses ±5 % for calories by default", () => {
    expect(targetRange("calories", 2400)).toEqual({ min: 2280, max: 2520 });
  });

  it("uses a 95 % lower bound and no upper bound for protein", () => {
    expect(targetRange("protein", 180)).toEqual({ min: 171, max: Infinity });
  });
});

describe("macroStatus", () => {
  it("classifies calories", () => {
    expect(macroStatus("calories", 2380, 2400)).toBe("met");
    expect(macroStatus("calories", 2279, 2400)).toBe("under");
    expect(macroStatus("calories", 2521, 2400)).toBe("over");
  });

  it("treats the band edges as met", () => {
    expect(macroStatus("calories", 2280, 2400)).toBe("met");
    expect(macroStatus("calories", 2520, 2400)).toBe("met");
  });

  it("never reports protein as over", () => {
    expect(macroStatus("protein", 176, 180)).toBe("met");
    expect(macroStatus("protein", 170, 180)).toBe("under");
    expect(macroStatus("protein", 400, 180)).toBe("met");
  });

  it("respects custom tolerances", () => {
    const strict = { caloriesPct: 1, proteinMinPct: 100, carbsPct: 1, fatPct: 1 };
    expect(macroStatus("protein", 179, 180, strict)).toBe("under");
    expect(macroStatus("fat", 72, 70, strict)).toBe("over");
  });
});

describe("evaluateMacros / isWithinTargets", () => {
  it("matches the spec example for Monday", () => {
    const monday = { calories: 2370, protein: 183, carbs: 245, fat: 71 };
    expect(evaluateMacros(monday, target)).toEqual({
      calories: "met",
      protein: "met",
      carbs: "met",
      fat: "met",
    });
    expect(isWithinTargets(monday, target)).toBe(true);
  });

  it("fails the day when one macro is off", () => {
    expect(isWithinTargets({ ...target, fat: 90 }, target)).toBe(false);
  });
});

describe("progressPercent", () => {
  it("clamps to 0–100", () => {
    expect(progressPercent(90, 180)).toBe(50);
    expect(progressPercent(300, 180)).toBe(100);
    expect(progressPercent(10, 0)).toBe(0);
  });
});
