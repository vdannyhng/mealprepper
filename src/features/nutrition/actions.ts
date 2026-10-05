"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { actionError, actionSuccess, type ActionState } from "@/lib/action-state";
import { toUserMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import {
  macroTargetSchema,
  planningPreferencesSchema,
  toleranceSchema,
} from "@/lib/validation/nutrition";
import { toFieldErrors } from "@/lib/validation/shared";

export async function saveDefaultMacroTarget(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = macroTargetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError("Bitte überprüfe deine Eingaben.", toFieldErrors(parsed.error));
  }

  const { calories, protein, carbs, fat, fiber } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("macro_targets").upsert(
    {
      user_id: user.id,
      name: "Standard",
      is_default: true,
      calories,
      protein,
      carbs,
      fat,
      fiber: fiber ?? null,
    },
    { onConflict: "user_id,name" },
  );
  if (error) return actionError(toUserMessage(error));

  revalidatePath("/", "layout");
  return actionSuccess("Ernährungsziele gespeichert.");
}

export async function saveTolerances(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = toleranceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError("Bitte überprüfe deine Eingaben.", toFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_preferences")
    .update({
      tolerance_calories_pct: parsed.data.caloriesPct,
      tolerance_protein_min_pct: parsed.data.proteinMinPct,
      tolerance_carbs_pct: parsed.data.carbsPct,
      tolerance_fat_pct: parsed.data.fatPct,
    })
    .eq("user_id", user.id);
  if (error) return actionError(toUserMessage(error));

  revalidatePath("/", "layout");
  return actionSuccess("Toleranzen gespeichert.");
}

export async function savePlanningPreferences(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = planningPreferencesSchema.safeParse({
    prepWeekdays: formData.getAll("prepWeekdays"),
    mealsPerDay: formData.get("mealsPerDay"),
    snacksPerDay: formData.get("snacksPerDay"),
  });
  if (!parsed.success) {
    return actionError("Bitte überprüfe deine Eingaben.", toFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_preferences")
    .update({
      prep_weekdays: [...new Set(parsed.data.prepWeekdays)].sort((a, b) => a - b),
      meals_per_day: parsed.data.mealsPerDay,
      snacks_per_day: parsed.data.snacksPerDay,
    })
    .eq("user_id", user.id);
  if (error) return actionError(toUserMessage(error));

  revalidatePath("/", "layout");
  return actionSuccess("Planung gespeichert.");
}
