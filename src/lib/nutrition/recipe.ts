import { roundTo, type Macros } from "./macros";
import { toBaseQuantity, type FoodUnit, type UnitConversion } from "./units";

/** Nutrient values of a food per `base_amount` of its base unit. */
export interface FoodNutrition extends UnitConversion {
  base_amount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
}

export interface Nutrients extends Macros {
  fiber: number;
}

export const ZERO_NUTRIENTS: Nutrients = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

export interface IngredientAmount {
  amount: number;
  unit: FoodUnit;
  food: FoodNutrition;
}

/** Nutrients for an amount of a food, e.g. 250 g chicken at 165 kcal/100 g → 412.5 kcal. */
export function ingredientNutrients(ingredient: IngredientAmount): Nutrients | null {
  const { food } = ingredient;
  const quantity = toBaseQuantity(ingredient.amount, ingredient.unit, food);
  if (quantity === null || food.base_amount <= 0) return null;
  const factor = quantity / food.base_amount;
  return {
    calories: roundTo(food.calories * factor),
    protein: roundTo(food.protein * factor),
    carbs: roundTo(food.carbs * factor),
    fat: roundTo(food.fat * factor),
    fiber: roundTo((food.fiber ?? 0) * factor),
  };
}

export function addNutrients(a: Nutrients, b: Nutrients): Nutrients {
  return {
    calories: roundTo(a.calories + b.calories),
    protein: roundTo(a.protein + b.protein),
    carbs: roundTo(a.carbs + b.carbs),
    fat: roundTo(a.fat + b.fat),
    fiber: roundTo(a.fiber + b.fiber),
  };
}

export function scaleNutrients(n: Nutrients, factor: number): Nutrients {
  return {
    calories: roundTo(n.calories * factor),
    protein: roundTo(n.protein * factor),
    carbs: roundTo(n.carbs * factor),
    fat: roundTo(n.fat * factor),
    fiber: roundTo(n.fiber * factor),
  };
}

export interface RecipeNutrition {
  total: Nutrients;
  perServing: Nutrients;
  /** Ingredients whose unit could not be converted (excluded from the totals). */
  unconvertible: number;
}

/** Deterministic recipe nutrition from its ingredients: totals and per serving. */
export function recipeNutrition(
  ingredients: readonly IngredientAmount[],
  servings: number,
): RecipeNutrition {
  let total = ZERO_NUTRIENTS;
  let unconvertible = 0;
  for (const ingredient of ingredients) {
    const n = ingredientNutrients(ingredient);
    if (n) total = addNutrients(total, n);
    else unconvertible++;
  }
  const perServing = servings > 0 ? scaleNutrients(total, 1 / servings) : ZERO_NUTRIENTS;
  return { total, perServing, unconvertible };
}

/** Scales ingredient amounts from one serving count to another (2 → 6 servings = ×3). */
export function scaleIngredients<T extends { amount: number }>(
  ingredients: readonly T[],
  fromServings: number,
  toServings: number,
): T[] {
  if (fromServings <= 0) return [...ingredients];
  const factor = toServings / fromServings;
  return ingredients.map((i) => ({ ...i, amount: roundTo(i.amount * factor) }));
}
