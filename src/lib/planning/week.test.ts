import { describe, expect, it } from "vitest";
import type { Nutrients } from "@/lib/nutrition/recipe";
import {
  dayNutrients,
  parseWeekStart,
  summarizeWeek,
  visibleSlots,
  weekDates,
  type PlannedMealNutrition,
} from "./week";

const n = (calories: number, protein: number, carbs: number, fat: number): Nutrients => ({
  calories,
  protein,
  carbs,
  fat,
  fiber: 0,
});

const target = { calories: 2400, protein: 180, carbs: 260, fat: 70 };
const dates = weekDates("2026-10-05");

describe("parseWeekStart", () => {
  it("snaps any date to its Monday", () => {
    expect(parseWeekStart("2026-10-08", "2026-01-01")).toBe("2026-10-05");
  });

  it("falls back to the current week for invalid input", () => {
    expect(parseWeekStart("2026-02-30", "2026-10-07")).toBe("2026-10-05");
    expect(parseWeekStart("drop table", "2026-10-07")).toBe("2026-10-05");
    expect(parseWeekStart(undefined, "2026-10-11")).toBe("2026-10-05");
  });
});

describe("weekDates", () => {
  it("returns Monday to Sunday", () => {
    expect(dates).toEqual([
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
      "2026-10-10",
      "2026-10-11",
    ]);
  });
});

describe("visibleSlots", () => {
  it("follows meals and snacks per day", () => {
    expect(visibleSlots(3, 1)).toEqual(["breakfast", "snack_1", "lunch", "dinner"]);
    expect(visibleSlots(2, 0)).toEqual(["lunch", "dinner"]);
    expect(visibleSlots(5, 2)).toEqual(["breakfast", "snack_1", "lunch", "snack_2", "dinner"]);
  });

  it("keeps slots that already contain meals", () => {
    expect(visibleSlots(2, 0, ["breakfast"])).toEqual(["breakfast", "lunch", "dinner"]);
  });
});

describe("dayNutrients", () => {
  it("multiplies per-serving values by planned servings", () => {
    const meals: PlannedMealNutrition[] = [
      { date: "2026-10-05", slot: "lunch", servings: 1.5, perServing: n(600, 50, 60, 15) },
      { date: "2026-10-05", slot: "dinner", servings: 1, perServing: n(500, 40, 50, 10) },
      { date: "2026-10-06", slot: "dinner", servings: 1, perServing: n(999, 99, 99, 99) },
    ];
    expect(dayNutrients(meals, "2026-10-05")).toEqual(n(1400, 115, 140, 32.5));
  });
});

describe("summarizeWeek", () => {
  const onTarget = (date: string): PlannedMealNutrition => ({
    date,
    slot: "lunch",
    servings: 1,
    perServing: n(2370, 183, 245, 71),
  });

  it("counts days within targets and averages only planned days", () => {
    const meals = [
      onTarget("2026-10-05"),
      onTarget("2026-10-06"),
      {
        date: "2026-10-07",
        slot: "lunch" as const,
        servings: 1,
        perServing: n(2000, 150, 200, 60),
      },
    ];
    const summary = summarizeWeek(dates, meals, target);
    expect(summary.plannedDays).toBe(3);
    expect(summary.mealCount).toBe(3);
    expect(summary.daysWithinCalories).toBe(2);
    expect(summary.daysProteinMet).toBe(2);
    expect(summary.daysAllMacrosMet).toBe(2);
    expect(summary.average?.calories).toBe(2246.67);
  });

  it("handles an empty week", () => {
    const summary = summarizeWeek(dates, [], target);
    expect(summary).toMatchObject({ plannedDays: 0, average: null, daysWithinCalories: 0 });
  });

  it("ignores meals outside the week", () => {
    expect(summarizeWeek(dates, [onTarget("2026-10-12")], target).mealCount).toBe(0);
  });
});
