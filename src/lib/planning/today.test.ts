import { describe, expect, it } from "vitest";
import type { Nutrients } from "@/lib/nutrition/recipe";
import { dayProgress, eatenNutrients, evaluateDay, type MealStatus } from "./today";

const n = (calories: number, protein: number, carbs: number, fat: number): Nutrients => ({
  calories,
  protein,
  carbs,
  fat,
  fiber: 0,
});
const meal = (status: MealStatus, servings = 1, perServing = n(600, 45, 65, 18)) => ({
  status,
  servings,
  perServing,
});
const target = { calories: 2400, protein: 180, carbs: 260, fat: 70 };

describe("eatenNutrients", () => {
  it("only counts eaten meals and respects servings", () => {
    const meals = [meal("eaten", 2), meal("planned"), meal("skipped"), meal("prepared")];
    expect(eatenNutrients(meals)).toEqual(n(1200, 90, 130, 36));
  });
});

describe("dayProgress", () => {
  it("does not count skipped meals as open", () => {
    expect(dayProgress([meal("eaten"), meal("eaten"), meal("planned"), meal("skipped")])).toEqual({
      eaten: 2,
      total: 3,
      percent: 67,
    });
  });

  it("handles an empty day", () => {
    expect(dayProgress([])).toEqual({ eaten: 0, total: 0, percent: 0 });
  });
});

describe("evaluateDay", () => {
  it("reports a day within all tolerances as met", () => {
    expect(evaluateDay({ calories: 2380, protein: 176, carbs: 255, fat: 68 }, target)).toEqual({
      caloriesMet: true,
      proteinMet: true,
      targetMet: true,
    });
  });

  it("separates calorie, protein and overall results", () => {
    expect(evaluateDay({ calories: 2400, protein: 150, carbs: 300, fat: 60 }, target)).toEqual({
      caloriesMet: true,
      proteinMet: false,
      targetMet: false,
    });
  });
});
