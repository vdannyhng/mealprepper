import { roundTo, type MacroKey, type Macros } from "./macros";

export type MacroStatus = "under" | "met" | "over";

export interface MacroTolerances {
  /** ± percent around the calorie target */
  caloriesPct: number;
  /** protein counts as reached from this percentage of the target upwards */
  proteinMinPct: number;
  /** ± percent around the carb target */
  carbsPct: number;
  /** ± percent around the fat target */
  fatPct: number;
}

export const DEFAULT_TOLERANCES: MacroTolerances = {
  caloriesPct: 5,
  proteinMinPct: 95,
  carbsPct: 10,
  fatPct: 10,
};

/** Lower and upper bound of the target range. Protein has no upper bound. */
export function targetRange(
  key: MacroKey,
  target: number,
  tolerances: MacroTolerances = DEFAULT_TOLERANCES,
): { min: number; max: number } {
  switch (key) {
    case "protein":
      return { min: roundTo((target * tolerances.proteinMinPct) / 100), max: Infinity };
    case "calories":
      return bandAround(target, tolerances.caloriesPct);
    case "carbs":
      return bandAround(target, tolerances.carbsPct);
    case "fat":
      return bandAround(target, tolerances.fatPct);
  }
}

function bandAround(target: number, pct: number) {
  return { min: roundTo(target * (1 - pct / 100)), max: roundTo(target * (1 + pct / 100)) };
}

/**
 * Classifies an actual value against its target.
 * Exceeding the protein target counts as "met" – more protein is never a miss.
 */
export function macroStatus(
  key: MacroKey,
  actual: number,
  target: number,
  tolerances: MacroTolerances = DEFAULT_TOLERANCES,
): MacroStatus {
  const { min, max } = targetRange(key, target, tolerances);
  const value = roundTo(actual);
  if (value < min) return "under";
  if (value > max) return "over";
  return "met";
}

export function evaluateMacros(
  actual: Macros,
  target: Macros,
  tolerances: MacroTolerances = DEFAULT_TOLERANCES,
): Record<MacroKey, MacroStatus> {
  return {
    calories: macroStatus("calories", actual.calories, target.calories, tolerances),
    protein: macroStatus("protein", actual.protein, target.protein, tolerances),
    carbs: macroStatus("carbs", actual.carbs, target.carbs, tolerances),
    fat: macroStatus("fat", actual.fat, target.fat, tolerances),
  };
}

/** A day is "on target" when every macro is within its tolerance band. */
export function isWithinTargets(
  actual: Macros,
  target: Macros,
  tolerances: MacroTolerances = DEFAULT_TOLERANCES,
): boolean {
  return Object.values(evaluateMacros(actual, target, tolerances)).every((s) => s === "met");
}

/** Progress in percent for progress bars, clamped to 0–100. */
export function progressPercent(actual: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((actual / target) * 100)));
}
