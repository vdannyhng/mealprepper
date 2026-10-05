import type { Enums } from "@/types/database";
import { roundTo } from "./macros";

export type FoodUnit = Enums<"food_unit">;
export type BaseUnit = "g" | "ml";

export const FOOD_UNITS: readonly FoodUnit[] = [
  "g",
  "kg",
  "ml",
  "l",
  "piece",
  "tbsp",
  "tsp",
  "serving",
];

export const UNIT_LABELS: Record<FoodUnit, string> = {
  g: "g",
  kg: "kg",
  ml: "ml",
  l: "l",
  piece: "Stück",
  tbsp: "EL",
  tsp: "TL",
  serving: "Portion",
};

/** Kitchen measures in ml. Applied 1:1 to grams (density ≈ 1), which is an approximation. */
const SPOON_ML = { tbsp: 15, tsp: 5 } as const;

/** What a food needs so amounts in any unit can be normalized to its base unit. */
export interface UnitConversion {
  base_unit: string;
  grams_per_piece: number | null;
  grams_per_serving: number | null;
}

/**
 * Converts an amount in `unit` into the food's base unit (g or ml).
 * g and ml are treated as interchangeable (density ≈ 1).
 * Returns null when the unit cannot be converted (e.g. "Stück" without a piece weight).
 */
export function toBaseQuantity(
  amount: number,
  unit: FoodUnit,
  food: UnitConversion,
): number | null {
  switch (unit) {
    case "g":
    case "ml":
      return amount;
    case "kg":
    case "l":
      return roundTo(amount * 1000);
    case "tbsp":
    case "tsp":
      return roundTo(amount * SPOON_ML[unit]);
    case "piece":
      return food.grams_per_piece ? roundTo(amount * food.grams_per_piece) : null;
    case "serving":
      return food.grams_per_serving ? roundTo(amount * food.grams_per_serving) : null;
  }
}

/** Units that make sense for a food, base unit first. */
export function availableUnits(food: UnitConversion): FoodUnit[] {
  const units: FoodUnit[] =
    food.base_unit === "ml" ? ["ml", "l", "g", "kg"] : ["g", "kg", "ml", "l"];
  if (food.grams_per_piece) units.unshift("piece");
  if (food.grams_per_serving) units.push("serving");
  units.push("tbsp", "tsp");
  return units;
}

/** The unit a new ingredient row should start with. */
export function defaultUnit(food: UnitConversion): FoodUnit {
  if (food.grams_per_piece) return "piece";
  return food.base_unit === "ml" ? "ml" : "g";
}

const amountFormat = new Intl.NumberFormat("de-CH", { maximumFractionDigits: 2 });

/** "800 g", "1.5 Stück", "1.3 kg" – large gram/ml values are shown in kg/l. */
export function formatQuantity(amount: number, unit: FoodUnit): string {
  if ((unit === "g" || unit === "ml") && amount >= 1000) {
    return `${amountFormat.format(roundTo(amount / 1000, 2))} ${unit === "g" ? "kg" : "l"}`;
  }
  const rounded = unit === "g" || unit === "ml" ? Math.round(amount) : roundTo(amount, 2);
  return `${amountFormat.format(rounded)} ${UNIT_LABELS[unit]}`;
}
