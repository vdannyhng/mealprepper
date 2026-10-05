import "server-only";
import { cache } from "react";
import { escapeLike, type Food } from "@/features/foods/queries";
import { recipeNutrition, type Nutrients, type RecipeNutrition } from "@/lib/nutrition/recipe";
import type { FoodUnit } from "@/lib/nutrition/units";
import { createClient } from "@/lib/supabase/server";
import type { RecipeFilter } from "@/lib/validation/recipes";
import type { Tables } from "@/types/database";

const NUTRITION_FIELDS =
  "base_amount, base_unit, calories, protein, carbs, fat, fiber, grams_per_piece, grams_per_serving";

export interface RecipeSummary {
  id: string;
  name: string;
  description: string | null;
  category: Tables<"recipes">["category"];
  tags: string[];
  servings: number;
  totalTime: number;
  isOwn: boolean;
  perServing: Nutrients;
}

export async function listRecipes(userId: string, filter: RecipeFilter): Promise<RecipeSummary[]> {
  const supabase = await createClient();
  let request = supabase
    .from("recipes")
    .select(
      `id, user_id, name, description, category, tags, servings, prep_time, cook_time,
       recipe_ingredients (amount, unit, food_items (${NUTRITION_FIELDS}))`,
    )
    .order("name");
  if (filter.scope === "mine") request = request.eq("user_id", userId);
  if (filter.category) request = request.eq("category", filter.category);
  if (filter.q) request = request.ilike("name", `%${escapeLike(filter.q)}%`);

  const { data, error } = await request;
  if (error) throw new Error("Rezepte konnten nicht geladen werden.", { cause: error });

  return data.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    category: r.category,
    tags: r.tags,
    servings: r.servings,
    totalTime: r.prep_time + r.cook_time,
    isOwn: r.user_id === userId,
    perServing: recipeNutrition(
      r.recipe_ingredients.map((i) => ({ amount: i.amount, unit: i.unit, food: i.food_items })),
      r.servings,
    ).perServing,
  }));
}

export interface RecipeIngredient {
  id: string;
  amount: number;
  unit: FoodUnit;
  note: string | null;
  food: Food;
}

export interface RecipeDetail extends Tables<"recipes"> {
  isOwn: boolean;
  ingredients: RecipeIngredient[];
  nutrition: RecipeNutrition;
}

/** Cached per request (used by generateMetadata and the page). */
export const getRecipe = cache(async (id: string, userId: string): Promise<RecipeDetail | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*, recipe_ingredients (id, amount, unit, note, sort_order, food_items (*))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Rezept konnte nicht geladen werden.", { cause: error });
  if (!data) return null;

  const { recipe_ingredients: rows, ...recipe } = data;
  const ingredients = [...rows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => ({ id: i.id, amount: i.amount, unit: i.unit, note: i.note, food: i.food_items }));

  return {
    ...recipe,
    isOwn: recipe.user_id === userId,
    ingredients,
    nutrition: recipeNutrition(ingredients, recipe.servings),
  };
});
