import "server-only";
import { addDays, type IsoDate } from "@/lib/dates";
import { recipeNutrition, type Nutrients } from "@/lib/nutrition/recipe";
import type { MealSlot } from "@/lib/planning/week";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

const NUTRITION_FIELDS =
  "base_amount, base_unit, calories, protein, carbs, fat, fiber, grams_per_piece, grams_per_serving";

/** A planned meal as the planner UI needs it (serializable for Client Components). */
export interface PlannedMeal {
  id: string;
  date: IsoDate;
  slot: MealSlot;
  servings: number;
  status: Enums<"meal_status">;
  recipeId: string;
  recipeName: string;
  perServing: Nutrients;
}

/** All planned meals between two dates (inclusive) for the signed-in user. */
export async function getPlannedMeals(from: IsoDate, to: IsoDate): Promise<PlannedMeal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planned_meals")
    .select(
      `id, date, meal_type, servings, status, sort_order,
       recipes (id, name, servings, recipe_ingredients (amount, unit, food_items (${NUTRITION_FIELDS})))`,
    )
    .gte("date", from)
    .lte("date", to)
    .order("date")
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error("Der Wochenplan konnte nicht geladen werden.", { cause: error });

  return data.map((m) => ({
    id: m.id,
    date: m.date,
    slot: m.meal_type,
    servings: m.servings,
    status: m.status,
    recipeId: m.recipes.id,
    recipeName: m.recipes.name,
    perServing: recipeNutrition(
      m.recipes.recipe_ingredients.map((i) => ({
        amount: i.amount,
        unit: i.unit,
        food: i.food_items,
      })),
      m.recipes.servings,
    ).perServing,
  }));
}

export function getWeekMeals(weekStart: IsoDate): Promise<PlannedMeal[]> {
  return getPlannedMeals(weekStart, addDays(weekStart, 6));
}
