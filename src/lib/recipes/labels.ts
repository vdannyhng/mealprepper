import type { Enums } from "@/types/database";

export const RECIPE_CATEGORY_LABELS: Record<Enums<"recipe_category">, string> = {
  breakfast: "Frühstück",
  lunch: "Mittagessen",
  dinner: "Abendessen",
  snack: "Snack",
};

/** Recipe tags offered in the UI (stored as plain text in recipes.tags). */
export const RECIPE_TAGS = [
  "meal_prep",
  "high_protein",
  "low_calorie",
  "vegetarian",
  "vegan",
  "quick",
] as const;
export type RecipeTag = (typeof RECIPE_TAGS)[number];

export function isRecipeTag(tag: string): tag is RecipeTag {
  return (RECIPE_TAGS as readonly string[]).includes(tag);
}

export const RECIPE_TAG_LABELS: Record<RecipeTag, string> = {
  meal_prep: "Meal Prep",
  high_protein: "High Protein",
  low_calorie: "Low Calorie",
  vegetarian: "Vegetarisch",
  vegan: "Vegan",
  quick: "Quick Meal",
};

export function tagLabel(tag: string): string {
  return RECIPE_TAG_LABELS[tag as RecipeTag] ?? tag;
}

export const FOOD_CATEGORY_LABELS: Record<Enums<"food_category">, string> = {
  protein: "Protein",
  carbs: "Kohlenhydrate",
  vegetables: "Gemüse",
  fruit: "Obst",
  dairy: "Milchprodukte",
  fats: "Fette & Öle",
  spices: "Gewürze",
  sauces: "Saucen",
  other: "Sonstiges",
};

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
