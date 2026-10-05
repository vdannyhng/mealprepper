import { describe, expect, it } from "vitest";
import { toFieldErrors } from "./shared";
import { foodSchema, recipeFilterSchema, recipeSchema } from "./recipes";

const FOOD_ID = "4f1c2b8e-1d2a-4c3b-9e8f-0a1b2c3d4e5f";

describe("foodSchema", () => {
  const valid = {
    name: "Hähnchenbrust",
    brand: "",
    category: "protein",
    baseUnit: "g",
    baseAmount: "100",
    calories: "165",
    protein: "31",
    carbs: "0",
    fat: "3,6",
    fiber: "",
    gramsPerPiece: "",
    gramsPerServing: "",
  };

  it("parses form strings, including decimal commas", () => {
    const result = foodSchema.parse(valid);
    expect(result.fat).toBe(3.6);
    expect(result.brand).toBeUndefined();
    expect(result.fiber).toBeUndefined();
  });

  it("rejects macros heavier than the reference amount", () => {
    const result = foodSchema.safeParse({ ...valid, protein: "80", carbs: "30" });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error).fat?.[0]).toMatch(/nicht mehr wiegen/);
  });

  it("rejects negative values", () => {
    expect(foodSchema.safeParse({ ...valid, calories: "-1" }).success).toBe(false);
  });
});

describe("recipeSchema", () => {
  const valid = {
    name: "Chicken Rice Bowl",
    description: "",
    category: "lunch",
    tags: ["meal_prep"],
    servings: "4",
    prepTime: "15",
    cookTime: "25",
    fridgeLifeDays: "4",
    freezerLifeDays: "",
    storageNotes: "",
    instructions: ["Reis kochen", "  ", ""],
    ingredients: [{ foodItemId: FOOD_ID, amount: "600", unit: "g", note: "" }],
  };

  it("coerces numbers and drops empty steps", () => {
    const result = recipeSchema.parse(valid);
    expect(result.servings).toBe(4);
    expect(result.freezerLifeDays).toBeUndefined();
    expect(result.instructions).toEqual(["Reis kochen"]);
  });

  it("requires at least one ingredient", () => {
    const result = recipeSchema.safeParse({ ...valid, ingredients: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toFieldErrors(result.error).ingredients).toEqual([
        "Füge mindestens eine Zutat hinzu.",
      ]);
    }
  });

  it("reports ingredient errors by row", () => {
    const result = recipeSchema.safeParse({
      ...valid,
      ingredients: [{ foodItemId: FOOD_ID, amount: "0", unit: "g" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error)["ingredients.0.amount"]).toBeDefined();
  });

  it("rejects zero servings and unknown tags", () => {
    expect(recipeSchema.safeParse({ ...valid, servings: "0" }).success).toBe(false);
    expect(recipeSchema.safeParse({ ...valid, tags: ["keto"] }).success).toBe(false);
  });
});

describe("recipeFilterSchema", () => {
  it("falls back to safe defaults for invalid query params", () => {
    expect(recipeFilterSchema.parse({ scope: "hacked", category: "", q: "  " })).toEqual({
      scope: "all",
      category: undefined,
      q: undefined,
    });
  });
});
