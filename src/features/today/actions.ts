"use server";

import { z } from "zod";
import { requireUser } from "@/features/auth/session";
import {
  getDefaultMacroTarget,
  getUserPreferences,
  toMacros,
  toTolerances,
} from "@/features/nutrition/queries";
import type { PlanResult } from "@/features/planning/actions";
import { getPlannedMeals } from "@/features/planning/queries";
import { isIsoDate } from "@/lib/dates";
import { toUserMessage } from "@/lib/errors";
import type { Nutrients } from "@/lib/nutrition/recipe";
import { eatenNutrients, evaluateDay, type DayEvaluation } from "@/lib/planning/today";
import { createClient } from "@/lib/supabase/server";

const statusSchema = z.object({
  id: z.uuid(),
  status: z.enum(["planned", "prepared", "eaten", "skipped"]),
});

const replaceSchema = z.object({ id: z.uuid(), recipeId: z.uuid() });

export async function setMealStatus(input: unknown): Promise<PlanResult> {
  await requireUser();
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Ungültige Eingabe." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("planned_meals")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error)
    return {
      ok: false,
      message: toUserMessage(error, "Der Status konnte nicht gespeichert werden."),
    };
  return { ok: true, data: undefined };
}

/** Swaps the recipe of a planned meal; the day's macros are recalculated from the new recipe. */
export async function replaceMeal(input: unknown): Promise<PlanResult> {
  await requireUser();
  const parsed = replaceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Ungültige Eingabe." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("planned_meals")
    .update({ recipe_id: parsed.data.recipeId, status: "planned" })
    .eq("id", parsed.data.id);
  if (error) {
    return {
      ok: false,
      message: toUserMessage(error, "Die Mahlzeit konnte nicht ersetzt werden.", {
        "42501": "Dieses Rezept kann nicht verwendet werden.",
      }),
    };
  }
  return { ok: true, data: undefined };
}

export interface DayResult extends DayEvaluation {
  eaten: Nutrients;
}

/**
 * "Tag abgeschlossen": evaluates the eaten meals against the targets on the server
 * (never trusting client-side numbers) and stores the result in nutrition_day_logs.
 */
export async function completeDay(date: string): Promise<PlanResult<DayResult>> {
  const user = await requireUser();
  if (!isIsoDate(date)) return { ok: false, message: "Ungültiges Datum." };

  const [meals, target, prefs] = await Promise.all([
    getPlannedMeals(date, date),
    getDefaultMacroTarget(user.id),
    getUserPreferences(user.id),
  ]);
  if (!target) return { ok: false, message: "Lege zuerst deine Ernährungsziele fest." };

  const eaten = eatenNutrients(meals);
  const evaluation = evaluateDay(eaten, toMacros(target), toTolerances(prefs));

  const supabase = await createClient();
  const { error } = await supabase.from("nutrition_day_logs").upsert(
    {
      user_id: user.id,
      date,
      calories: Math.round(eaten.calories * 10) / 10,
      protein: Math.round(eaten.protein * 10) / 10,
      carbs: Math.round(eaten.carbs * 10) / 10,
      fat: Math.round(eaten.fat * 10) / 10,
      completed: true,
      target_met: evaluation.targetMet,
    },
    { onConflict: "user_id,date" },
  );
  if (error)
    return {
      ok: false,
      message: toUserMessage(error, "Der Tag konnte nicht abgeschlossen werden."),
    };
  return { ok: true, data: { ...evaluation, eaten } };
}
