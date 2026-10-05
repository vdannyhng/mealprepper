"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { actionError, type ActionState } from "@/lib/action-state";
import { toUserMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { foodSchema, type FoodInput } from "@/lib/validation/recipes";
import { toFieldErrors } from "@/lib/validation/shared";
import { findFoods, type Food } from "./queries";

const FOOD_ERRORS = {
  "23505": "Dieses Lebensmittel existiert bereits.",
  "23503":
    "Dieses Lebensmittel wird noch in einem Rezept verwendet und kann nicht gelöscht werden.",
};

function toRow(input: FoodInput) {
  return {
    name: input.name,
    brand: input.brand ?? null,
    category: input.category,
    base_unit: input.baseUnit,
    base_amount: input.baseAmount,
    calories: input.calories,
    protein: input.protein,
    carbs: input.carbs,
    fat: input.fat,
    fiber: input.fiber ?? null,
    grams_per_piece: input.gramsPerPiece ?? null,
    grams_per_serving: input.gramsPerServing ?? null,
  };
}

/** Food search for the ingredient picker (global catalog + own foods). */
export async function searchFoods(query: string): Promise<Food[]> {
  await requireUser();
  const q = typeof query === "string" ? query.trim().slice(0, 100) : "";
  return findFoods({ query: q || undefined, limit: 20 });
}

export async function createFood(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = foodSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError("Bitte überprüfe deine Eingaben.", toFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("food_items")
    .insert({ ...toRow(parsed.data), user_id: user.id });
  if (error) return actionError(toUserMessage(error, undefined, FOOD_ERRORS));

  revalidatePath("/lebensmittel");
  redirect("/lebensmittel?gespeichert=1");
}

export async function updateFood(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = foodSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError("Bitte überprüfe deine Eingaben.", toFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_items")
    .update(toRow(parsed.data))
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");
  if (error) return actionError(toUserMessage(error, undefined, FOOD_ERRORS));
  if (!data.length) return actionError("Dieses Lebensmittel kann nicht bearbeitet werden.");

  revalidatePath("/lebensmittel");
  revalidatePath("/rezepte", "layout");
  redirect("/lebensmittel?gespeichert=1");
}

export async function deleteFood(id: string): Promise<ActionState> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("food_items").delete().eq("id", id).eq("user_id", user.id);
  if (error) return actionError(toUserMessage(error, undefined, FOOD_ERRORS));

  revalidatePath("/lebensmittel");
  redirect("/lebensmittel");
}
