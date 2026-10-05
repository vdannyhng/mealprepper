"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/features/auth/session";
import { getUserPreferences } from "@/features/nutrition/queries";
import type { PlanResult } from "@/features/planning/actions";
import { getPlannedMeals } from "@/features/planning/queries";
import { isIsoDate } from "@/lib/dates";
import { toUserMessage } from "@/lib/errors";
import {
  aggregatePrepRecipes,
  buildPrepTasks,
  estimatePrepMinutes,
  prepWindow,
} from "@/lib/meal-prep/session";
import { createClient } from "@/lib/supabase/server";

const SESSION_ERRORS = { "23505": "Für diesen Tag gibt es bereits eine Meal-Prep-Session." };

/** Creates a session for a prep day from the weekly plan and opens it. */
export async function createPrepSession(date: string): Promise<PlanResult> {
  const user = await requireUser();
  if (!isIsoDate(date)) return { ok: false, message: "Ungültiges Datum." };

  const prefs = await getUserPreferences(user.id);
  const window = prepWindow(date, prefs?.prep_weekdays ?? [7]);
  const meals = await getPlannedMeals(window.date, window.coversTo);
  const recipes = aggregatePrepRecipes(meals, window);
  if (!recipes.length) {
    return { ok: false, message: "Für diesen Zeitraum sind noch keine Mahlzeiten geplant." };
  }

  const supabase = await createClient();
  const { data: details, error: detailError } = await supabase
    .from("recipes")
    .select("id, name, prep_time, cook_time, instructions")
    .in(
      "id",
      recipes.map((r) => r.recipeId),
    );
  if (detailError) return { ok: false, message: toUserMessage(detailError) };

  const steps = recipes.map((r) => {
    const d = details.find((x) => x.id === r.recipeId);
    return {
      recipeId: r.recipeId,
      recipeName: r.recipeName,
      servings: r.servings,
      prepTime: d?.prep_time ?? 0,
      cookTime: d?.cook_time ?? 0,
      instructions: d?.instructions ?? [],
    };
  });

  const { data: id, error } = await supabase.rpc("create_prep_session", {
    p_date: window.date,
    p_covers_to: window.coversTo,
    p_recipes: recipes.map((r) => ({ recipe_id: r.recipeId, servings: r.servings })),
    p_tasks: buildPrepTasks(steps).map((t) => ({ title: t.title, recipe_id: t.recipeId ?? "" })),
    p_estimated_minutes: Math.min(1440, estimatePrepMinutes(steps)),
  });
  if (error || !id) {
    return {
      ok: false,
      message: toUserMessage(error, "Die Session konnte nicht erstellt werden.", SESSION_ERRORS),
    };
  }

  revalidatePath("/meal-prep");
  redirect(`/meal-prep/${id}`);
}

const toggleSchema = z.object({ sessionId: z.uuid(), taskId: z.uuid(), completed: z.boolean() });

/** Checks/unchecks a checklist task (autosave) and marks the session as started. */
export async function toggleTask(input: unknown): Promise<PlanResult> {
  await requireUser();
  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Ungültige Eingabe." };
  const { sessionId, taskId, completed } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("meal_prep_tasks")
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", taskId)
    .eq("session_id", sessionId);
  if (error)
    return {
      ok: false,
      message: toUserMessage(error, "Die Aufgabe konnte nicht gespeichert werden."),
    };

  if (completed) {
    await supabase
      .from("meal_prep_sessions")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("status", "planned");
  }
  return { ok: true, data: undefined };
}

const completeSchema = z.object({
  sessionId: z.uuid(),
  completedPortions: z.number().int().min(0).max(500),
  durationMinutes: z.number().int().min(1).max(1440).nullable(),
  notes: z.string().trim().max(2000),
  photoPath: z.string().max(300).nullable(),
});

/** "Meal Prep abgeschlossen" – stores the result and marks the covered meals as prepared. */
export async function completePrepSession(input: unknown): Promise<PlanResult> {
  const user = await requireUser();
  const parsed = completeSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  const d = parsed.data;
  if (d.photoPath && !d.photoPath.startsWith(`${user.id}/`)) {
    return { ok: false, message: "Ungültiges Foto." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_prep_session", {
    p_session_id: d.sessionId,
    p_completed_portions: d.completedPortions,
    p_duration_minutes: d.durationMinutes,
    p_notes: d.notes || null,
    p_photo_path: d.photoPath,
  });
  if (error)
    return {
      ok: false,
      message: toUserMessage(error, "Die Session konnte nicht abgeschlossen werden."),
    };

  revalidatePath("/meal-prep", "layout");
  revalidatePath("/dashboard");
  return { ok: true, data: undefined };
}

/** Discards a session that has not been completed (e.g. to regenerate it after plan changes). */
export async function deletePrepSession(sessionId: string): Promise<PlanResult> {
  await requireUser();
  if (!z.uuid().safeParse(sessionId).success) return { ok: false, message: "Ungültige Eingabe." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("meal_prep_sessions")
    .delete()
    .eq("id", sessionId)
    .neq("status", "completed");
  if (error)
    return {
      ok: false,
      message: toUserMessage(error, "Die Session konnte nicht gelöscht werden."),
    };

  revalidatePath("/meal-prep");
  redirect("/meal-prep");
}
