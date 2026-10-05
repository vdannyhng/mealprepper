/** Energy density per gram (Atwater factors). */
export const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

export type MacroKey = "calories" | "protein" | "carbs" | "fat";

export const MACRO_KEYS: readonly MacroKey[] = ["calories", "protein", "carbs", "fat"];

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const ZERO_MACROS: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };

/**
 * Rounds away binary floating point noise (e.g. 0.1 + 0.2) before display or comparison.
 * Values are kept at two decimals internally; display rounding happens in formatters.
 */
export function roundTo(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Calories implied by the given macronutrients in grams. */
export function energyFromMacros(macros: Pick<Macros, "protein" | "carbs" | "fat">): number {
  return roundTo(
    macros.protein * KCAL_PER_GRAM.protein +
      macros.carbs * KCAL_PER_GRAM.carbs +
      macros.fat * KCAL_PER_GRAM.fat,
  );
}

export function sumMacros(items: readonly Macros[]): Macros {
  const total = items.reduce<Macros>(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    ZERO_MACROS,
  );
  return scaleMacros(total, 1);
}

export function scaleMacros(macros: Macros, factor: number): Macros {
  return {
    calories: roundTo(macros.calories * factor),
    protein: roundTo(macros.protein * factor),
    carbs: roundTo(macros.carbs * factor),
    fat: roundTo(macros.fat * factor),
  };
}

/**
 * Relative difference between the stated calories and the calories derived from the macros.
 * Used to warn about inconsistent targets (e.g. 2000 kcal but 300 g protein).
 */
export function calorieMacroMismatch(target: Macros): number {
  if (target.calories <= 0) return 0;
  return roundTo(Math.abs(energyFromMacros(target) - target.calories) / target.calories, 4);
}

/** Share of total energy per macro, in percent (0–100). */
export function macroEnergySplit(macros: Pick<Macros, "protein" | "carbs" | "fat">) {
  const total = energyFromMacros(macros);
  if (total === 0) return { protein: 0, carbs: 0, fat: 0 };
  return {
    protein: Math.round(((macros.protein * KCAL_PER_GRAM.protein) / total) * 100),
    carbs: Math.round(((macros.carbs * KCAL_PER_GRAM.carbs) / total) * 100),
    fat: Math.round(((macros.fat * KCAL_PER_GRAM.fat) / total) * 100),
  };
}
