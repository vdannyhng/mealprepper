"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { actionError, type ActionState } from "@/lib/action-state";
import { toUserMessage } from "@/lib/errors";
import { isRecipeTag } from "@/lib/recipes/labels";
import { createClient } from "@/lib/supabase/server";
import { recipeSchema, type RecipeInput } from "@/lib/validation/recipes";
import { toFieldErrors } from "@/lib/validation/shared";
import { getRecipe } from "./queries";

const RECIPE_ERRORS = {
  "23503": "Dieses Rezept ist noch im Wochenplan oder in einer Meal-Prep-Session eingeplant.",
};

function toRpcPayload(input: RecipeInput) {
  return {
    p_recipe: {
      name: input.name,
      description: input.description ?? null,
      category: input.category,
      tags: input.tags,
      servings: input.servings,
      prep_time: input.prepTime,
      cook_time: input.cookTime,
      fridge_life_days: input.fridgeLifeDays ?? null,
      freezer_life_days: input.freezerLifeDays ?? null,
      storage_notes: input.storageNotes ?? null,
      instructions: input.instructions,
    },
    p_ingredients: input.ingredients.map((i) => ({
      food_item_id: i.foodItemId,
      amount: i.amount,
      unit: i.unit,
      note: i.note ?? null,
    })),
  };
}

/** Creates (no id) or updates a recipe including its ingredients, then opens it. */
export async function saveRecipe(input: unknown, recipeId?: string): Promise<ActionState> {
  await requireUser();
  const parsed = recipeSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Bitte überprüfe deine Eingaben.", toFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc("save_recipe", {
    ...toRpcPayload(parsed.data),
    ...(recipeId ? { p_recipe_id: recipeId } : {}),
  });
  if (error || !id) {
    return actionError(toUserMessage(error, "Das Rezept konnte nicht gespeichert werden."));
  }

  revalidatePath("/rezepte", "layout");
  redirect(`/rezepte/${id}`);
}

/** Copies a (global or own) recipe into the user's own recipes for editing. */
export async function duplicateRecipe(recipeId: string): Promise<ActionState> {
  const user = await requireUser();
  const recipe = await getRecipe(recipeId, user.id);
  if (!recipe) return actionError("Das Rezept wurde nicht gefunden.");

  const input: RecipeInput = {
    name: `${recipe.name} (Kopie)`.slice(0, 120),
    description: recipe.description ?? undefined,
    category: recipe.category,
    tags: recipe.tags.filter(isRecipeTag),
    servings: recipe.servings,
    prepTime: recipe.prep_time,
    cookTime: recipe.cook_time,
    fridgeLifeDays: recipe.fridge_life_days ?? undefined,
    freezerLifeDays: recipe.freezer_life_days ?? undefined,
    storageNotes: recipe.storage_notes ?? undefined,
    instructions: recipe.instructions,
    ingredients: recipe.ingredients.map((i) => ({
      foodItemId: i.food.id,
      amount: i.amount,
      unit: i.unit,
      note: i.note ?? undefined,
    })),
  };

  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc("save_recipe", toRpcPayload(input));
  if (error || !id)
    return actionError(toUserMessage(error, "Das Rezept konnte nicht kopiert werden."));

  revalidatePath("/rezepte", "layout");
  redirect(`/rezepte/${id}/bearbeiten`);
}

export async function deleteRecipe(recipeId: string): Promise<ActionState> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", recipeId)
    .eq("user_id", user.id);
  if (error) return actionError(toUserMessage(error, undefined, RECIPE_ERRORS));

  revalidatePath("/rezepte", "layout");
  redirect("/rezepte");
}
