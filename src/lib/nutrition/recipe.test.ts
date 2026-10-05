import { describe, expect, it } from "vitest";
import {
  ingredientNutrients,
  recipeNutrition,
  scaleIngredients,
  type FoodNutrition,
} from "./recipe";
import { availableUnits, formatQuantity, toBaseQuantity } from "./units";

const chicken: FoodNutrition = {
  base_amount: 100,
  base_unit: "g",
  calories: 165,
  protein: 31,
  carbs: 0,
  fat: 3.6,
  fiber: null,
  grams_per_piece: null,
  grams_per_serving: null,
};
const egg: FoodNutrition = {
  base_amount: 100,
  base_unit: "g",
  calories: 143,
  protein: 12.6,
  carbs: 0.7,
  fat: 9.5,
  fiber: 0,
  grams_per_piece: 60,
  grams_per_serving: null,
};
const milk: FoodNutrition = {
  base_amount: 100,
  base_unit: "ml",
  calories: 47,
  protein: 3.4,
  carbs: 4.9,
  fat: 1.5,
  fiber: null,
  grams_per_piece: null,
  grams_per_serving: null,
};

describe("toBaseQuantity", () => {
  it("normalizes units to g/ml", () => {
    expect(toBaseQuantity(1.3, "kg", chicken)).toBe(1300);
    expect(toBaseQuantity(0.25, "l", milk)).toBe(250);
    expect(toBaseQuantity(2, "tbsp", milk)).toBe(30);
    expect(toBaseQuantity(3, "tsp", chicken)).toBe(15);
    expect(toBaseQuantity(4, "piece", egg)).toBe(240);
  });

  it("returns null for units the food cannot express", () => {
    expect(toBaseQuantity(2, "piece", chicken)).toBeNull();
    expect(toBaseQuantity(1, "serving", chicken)).toBeNull();
  });
});

describe("availableUnits", () => {
  it("offers Stück only with a piece weight", () => {
    expect(availableUnits(egg)[0]).toBe("piece");
    expect(availableUnits(chicken)).not.toContain("piece");
    expect(availableUnits(milk)[0]).toBe("ml");
  });
});

describe("ingredientNutrients", () => {
  it("matches the spec example: 250 g at 165 kcal/100 g = 412.5 kcal", () => {
    expect(ingredientNutrients({ amount: 250, unit: "g", food: chicken })).toEqual({
      calories: 412.5,
      protein: 77.5,
      carbs: 0,
      fat: 9,
      fiber: 0,
    });
  });

  it("uses the piece weight", () => {
    expect(ingredientNutrients({ amount: 2, unit: "piece", food: egg })?.calories).toBe(171.6);
  });
});

describe("recipeNutrition", () => {
  it("computes totals and per-serving values", () => {
    const result = recipeNutrition(
      [
        { amount: 1, unit: "kg", food: chicken },
        { amount: 500, unit: "ml", food: milk },
      ],
      4,
    );
    expect(result.total.calories).toBe(1885);
    expect(result.perServing.calories).toBe(471.25);
    expect(result.perServing.protein).toBe(81.75);
    expect(result.unconvertible).toBe(0);
  });

  it("reports ingredients that cannot be converted", () => {
    const result = recipeNutrition([{ amount: 2, unit: "piece", food: chicken }], 1);
    expect(result.unconvertible).toBe(1);
    expect(result.total.calories).toBe(0);
  });

  it("handles zero servings without dividing by zero", () => {
    expect(
      recipeNutrition([{ amount: 100, unit: "g", food: chicken }], 0).perServing.calories,
    ).toBe(0);
  });
});

describe("scaleIngredients", () => {
  it("matches the spec example: 2 → 6 servings", () => {
    const scaled = scaleIngredients(
      [
        { name: "Hähnchen", amount: 400 },
        { name: "Reis", amount: 200 },
      ],
      2,
      6,
    );
    expect(scaled.map((i) => i.amount)).toEqual([1200, 600]);
  });

  it("keeps two decimals for odd factors", () => {
    expect(scaleIngredients([{ amount: 100 }], 3, 1)[0]?.amount).toBe(33.33);
  });
});

describe("formatQuantity", () => {
  it("formats for display", () => {
    expect(formatQuantity(1300, "g")).toBe("1.3 kg");
    expect(formatQuantity(133.33, "g")).toBe("133 g");
    expect(formatQuantity(1.5, "piece")).toBe("1.5 Stück");
    expect(formatQuantity(2, "tbsp")).toBe("2 EL");
  });
});
