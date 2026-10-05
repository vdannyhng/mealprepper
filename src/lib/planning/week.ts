import { addDays, isIsoDate, startOfIsoWeek, type IsoDate } from "@/lib/dates";
import type { Macros } from "@/lib/nutrition/macros";
import {
  ZERO_NUTRIENTS,
  addNutrients,
  scaleNutrients,
  type Nutrients,
} from "@/lib/nutrition/recipe";
import { DEFAULT_TOLERANCES, macroStatus, type MacroTolerances } from "@/lib/nutrition/tolerance";
import type { Enums } from "@/types/database";

export type MealSlot = Enums<"meal_slot">;

/** Display order of the meal slots within a day. */
export const SLOT_ORDER: readonly MealSlot[] = [
  "breakfast",
  "snack_1",
  "lunch",
  "snack_2",
  "dinner",
];

export const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: "Frühstück",
  snack_1: "Snack 1",
  lunch: "Mittagessen",
  snack_2: "Snack 2",
  dinner: "Abendessen",
};

/** A planned meal reduced to what the week calculations need. */
export interface PlannedMealNutrition {
  date: IsoDate;
  slot: MealSlot;
  servings: number;
  /** Nutrients of one recipe serving. */
  perServing: Nutrients;
}

/** The Monday of the requested week; falls back to the current week for invalid input. */
export function parseWeekStart(param: unknown, today: IsoDate): IsoDate {
  return startOfIsoWeek(isIsoDate(param) ? param : today);
}

export function weekDates(weekStart: IsoDate): IsoDate[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/**
 * Slots shown in the planner, derived from the user's meals/snacks per day.
 * Slots that already contain meals are always shown so nothing disappears.
 */
export function visibleSlots(
  mealsPerDay: number,
  snacksPerDay: number,
  occupied: Iterable<MealSlot> = [],
): MealSlot[] {
  const visible = new Set<MealSlot>(occupied);
  const mains: MealSlot[] =
    mealsPerDay >= 3
      ? ["breakfast", "lunch", "dinner"]
      : mealsPerDay === 2
        ? ["lunch", "dinner"]
        : ["lunch"];
  for (const slot of mains) visible.add(slot);
  if (snacksPerDay >= 1) visible.add("snack_1");
  if (snacksPerDay >= 2) visible.add("snack_2");
  return SLOT_ORDER.filter((slot) => visible.has(slot));
}

export function mealNutrients(
  meal: Pick<PlannedMealNutrition, "servings" | "perServing">,
): Nutrients {
  return scaleNutrients(meal.perServing, meal.servings);
}

export function dayNutrients(meals: readonly PlannedMealNutrition[], date: IsoDate): Nutrients {
  return meals
    .filter((m) => m.date === date)
    .reduce((total, meal) => addNutrients(total, mealNutrients(meal)), ZERO_NUTRIENTS);
}

export interface WeekSummary {
  mealCount: number;
  plannedDays: number;
  /** Average per planned day (days without meals are not counted), null if nothing is planned. */
  average: Nutrients | null;
  daysWithinCalories: number;
  daysProteinMet: number;
  daysAllMacrosMet: number;
}

export function summarizeWeek(
  dates: readonly IsoDate[],
  meals: readonly PlannedMealNutrition[],
  target: Macros | null,
  tolerances: MacroTolerances = DEFAULT_TOLERANCES,
): WeekSummary {
  const planned = dates.filter((d) => meals.some((m) => m.date === d));
  const totals = planned.map((d) => dayNutrients(meals, d));

  let daysWithinCalories = 0;
  let daysProteinMet = 0;
  let daysAllMacrosMet = 0;
  if (target) {
    for (const day of totals) {
      const calories = macroStatus("calories", day.calories, target.calories, tolerances) === "met";
      const protein = macroStatus("protein", day.protein, target.protein, tolerances) === "met";
      const carbs = macroStatus("carbs", day.carbs, target.carbs, tolerances) === "met";
      const fat = macroStatus("fat", day.fat, target.fat, tolerances) === "met";
      if (calories) daysWithinCalories++;
      if (protein) daysProteinMet++;
      if (calories && protein && carbs && fat) daysAllMacrosMet++;
    }
  }

  const sum = totals.reduce(addNutrients, ZERO_NUTRIENTS);
  return {
    mealCount: meals.filter((m) => dates.includes(m.date)).length,
    plannedDays: planned.length,
    average: planned.length ? scaleNutrients(sum, 1 / planned.length) : null,
    daysWithinCalories,
    daysProteinMet,
    daysAllMacrosMet,
  };
}
