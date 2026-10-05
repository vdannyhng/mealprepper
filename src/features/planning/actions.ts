"use server";

import { requireUser } from "@/features/auth/session";
import { isIsoDate, isoWeekday } from "@/lib/dates";
import { toUserMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import {
  addPlannedMealSchema,
  copyDaySchema,
  movePlannedMealSchema,
  plannedMealServingsSchema,
} from "@/lib/validation/planning";
import { getWeekMeals, type PlannedMeal } from "./queries";

/** Planner actions return data instead of redirecting, so the UI can update optimistically. */
export type PlanResult<T = undefined> = { ok: true; data: T } | { ok: false; message: string };

const PLAN_ERRORS = {
  "42501": "Dieses Rezept kann nicht eingeplant werden.",
  "23514": "Das Datum liegt ausserhalb der geplanten Woche.",
};

function fail(error: unknown, fallback: string): PlanResult<never> {
  return { ok: false, message: toUserMessage(error, fallback, PLAN_ERRORS) };
}

/** Adds a recipe to a slot; creates the weekly plan on first use. Returns the new meal id. */
export async function addPlannedMeal(input: unknown): Promise<PlanResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = addPlannedMealSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  const { weekStart, date, slot, recipeId, servings } = parsed.data;

  const supabase = await createClient();
  const { data: plan, error: planError } = await supabase
    .from("weekly_plans")
    .upsert(
      { user_id: user.id, week_start_date: weekStart },
      { onConflict: "user_id,week_start_date" },
    )
    .select("id")
    .single();
  if (planError) return fail(planError, "Der Wochenplan konnte nicht angelegt werden.");

  const { data, error } = await supabase
    .from("planned_meals")
    .insert({ weekly_plan_id: plan.id, date, meal_type: slot, recipe_id: recipeId, servings })
    .select("id")
    .single();
  if (error) return fail(error, "Die Mahlzeit konnte nicht eingeplant werden.");
  return { ok: true, data: { id: data.id } };
}

export async function movePlannedMeal(input: unknown): Promise<PlanResult> {
  await requireUser();
  const parsed = movePlannedMealSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Ungültige Eingabe." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("planned_meals")
    .update({ date: parsed.data.date, meal_type: parsed.data.slot })
    .eq("id", parsed.data.id);
  if (error) return fail(error, "Die Mahlzeit konnte nicht verschoben werden.");
  return { ok: true, data: undefined };
}

export async function setPlannedMealServings(input: unknown): Promise<PlanResult> {
  await requireUser();
  const parsed = plannedMealServingsSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("planned_meals")
    .update({ servings: parsed.data.servings })
    .eq("id", parsed.data.id);
  if (error) return fail(error, "Die Portionen konnten nicht gespeichert werden.");
  return { ok: true, data: undefined };
}

export async function removePlannedMeal(id: string): Promise<PlanResult> {
  await requireUser();
  const parsed = movePlannedMealSchema.shape.id.safeParse(id);
  if (!parsed.success) return { ok: false, message: "Ungültige Eingabe." };

  const supabase = await createClient();
  const { error } = await supabase.from("planned_meals").delete().eq("id", parsed.data);
  if (error) return fail(error, "Die Mahlzeit konnte nicht entfernt werden.");
  return { ok: true, data: undefined };
}

/** Copies a day's meals to other days of the same week (atomic, via RPC). */
export async function copyPlannedDay(input: unknown): Promise<PlanResult<{ copied: number }>> {
  await requireUser();
  const parsed = copyDaySchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("copy_planned_day", {
    p_week_start: parsed.data.weekStart,
    p_from: parsed.data.from,
    p_to: parsed.data.to,
    p_replace: parsed.data.replace,
  });
  if (error) return fail(error, "Der Tag konnte nicht kopiert werden.");
  return { ok: true, data: { copied: data } };
}

/** Removes all meals of one day. RLS limits the delete to the user's own plans. */
export async function clearPlannedDay(date: string): Promise<PlanResult> {
  await requireUser();
  if (!isIsoDate(date)) return { ok: false, message: "Ungültiges Datum." };

  const supabase = await createClient();
  const { error } = await supabase.from("planned_meals").delete().eq("date", date);
  if (error) return fail(error, "Der Tag konnte nicht geleert werden.");
  return { ok: true, data: undefined };
}

/** Reloads a week (used after bulk operations such as copying a day). */
export async function loadWeekMeals(weekStart: string): Promise<PlanResult<PlannedMeal[]>> {
  await requireUser();
  if (!isIsoDate(weekStart) || isoWeekday(weekStart) !== 1) {
    return { ok: false, message: "Ungültige Woche." };
  }
  try {
    return { ok: true, data: await getWeekMeals(weekStart) };
  } catch (error) {
    return fail(error, "Der Wochenplan konnte nicht geladen werden.");
  }
}
