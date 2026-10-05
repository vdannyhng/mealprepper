import type { Macros } from "@/lib/nutrition/macros";
import { ZERO_NUTRIENTS, addNutrients, type Nutrients } from "@/lib/nutrition/recipe";
import {
  DEFAULT_TOLERANCES,
  evaluateMacros,
  type MacroTolerances,
} from "@/lib/nutrition/tolerance";
import type { Enums } from "@/types/database";
import { mealNutrients, type PlannedMealNutrition } from "./week";

export type MealStatus = Enums<"meal_status">;

export const MEAL_STATUS_LABELS: Record<MealStatus, string> = {
  planned: "Geplant",
  prepared: "Vorbereitet",
  eaten: "Gegessen",
  skipped: "Übersprungen",
  replaced: "Ersetzt",
};

type MealWithStatus = Pick<PlannedMealNutrition, "servings" | "perServing"> & {
  status: MealStatus;
};

/** Nutrients of the meals marked as eaten. */
export function eatenNutrients(meals: readonly MealWithStatus[]): Nutrients {
  return meals
    .filter((m) => m.status === "eaten")
    .reduce((total, m) => addNutrients(total, mealNutrients(m)), ZERO_NUTRIENTS);
}

/** "3 / 4 Mahlzeiten gegessen" – skipped meals do not count as open. */
export function dayProgress(meals: readonly { status: MealStatus }[]) {
  const relevant = meals.filter((m) => m.status !== "skipped");
  const eaten = relevant.filter((m) => m.status === "eaten").length;
  return {
    eaten,
    total: relevant.length,
    percent: relevant.length ? Math.round((eaten / relevant.length) * 100) : 0,
  };
}

export interface DayEvaluation {
  caloriesMet: boolean;
  proteinMet: boolean;
  /** All four macros within their tolerance band. */
  targetMet: boolean;
}

/** Result shown when a day is completed ("Tag abgeschlossen"). */
export function evaluateDay(
  eaten: Macros,
  target: Macros,
  tolerances: MacroTolerances = DEFAULT_TOLERANCES,
): DayEvaluation {
  const status = evaluateMacros(eaten, target, tolerances);
  return {
    caloriesMet: status.calories === "met",
    proteinMet: status.protein === "met",
    targetMet: Object.values(status).every((s) => s === "met"),
  };
}
