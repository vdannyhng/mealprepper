import "server-only";
import type { IsoDate } from "@/lib/dates";
import { taskProgress } from "@/lib/meal-prep/session";
import type { FoodNutrition } from "@/lib/nutrition/recipe";
import type { FoodUnit } from "@/lib/nutrition/units";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

const PHOTO_BUCKET = "meal-prep-photos";
const SIGNED_URL_SECONDS = 60 * 60;

export interface SessionSummary {
  id: string;
  date: IsoDate;
  coversTo: IsoDate | null;
  status: Enums<"prep_session_status">;
  plannedPortions: number | null;
  completedPortions: number | null;
  estimatedMinutes: number | null;
  recipeNames: string[];
  progress: number;
  hasPhoto: boolean;
}

/** Sessions between two dates (inclusive), newest first. */
export async function listSessions(from: IsoDate, to: IsoDate): Promise<SessionSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meal_prep_sessions")
    .select(
      `id, date, covers_to, status, planned_portions, completed_portions, estimated_minutes,
       proof_photo_url, meal_prep_session_recipes (recipes (name)), meal_prep_tasks (completed)`,
    )
    .neq("status", "cancelled")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: false });
  if (error) throw new Error("Meal-Prep-Sessions konnten nicht geladen werden.", { cause: error });

  return data.map((s) => ({
    id: s.id,
    date: s.date,
    coversTo: s.covers_to,
    status: s.status,
    plannedPortions: s.planned_portions,
    completedPortions: s.completed_portions,
    estimatedMinutes: s.estimated_minutes,
    recipeNames: s.meal_prep_session_recipes.map((r) => r.recipes.name),
    progress: taskProgress(s.meal_prep_tasks),
    hasPhoto: Boolean(s.proof_photo_url),
  }));
}

/** Dates of all completed sessions (for streaks and the history). */
export async function getCompletedSessionDates(): Promise<IsoDate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meal_prep_sessions")
    .select("date")
    .eq("status", "completed")
    .order("date");
  if (error)
    throw new Error("Die Meal-Prep-Historie konnte nicht geladen werden.", { cause: error });
  return data.map((s) => s.date);
}

export interface SessionIngredient {
  name: string;
  amount: number;
  unit: FoodUnit;
  food: FoodNutrition;
}

export interface SessionDetail {
  id: string;
  date: IsoDate;
  coversTo: IsoDate | null;
  status: Enums<"prep_session_status">;
  startedAt: string | null;
  completedAt: string | null;
  plannedPortions: number | null;
  completedPortions: number | null;
  durationMinutes: number | null;
  estimatedMinutes: number | null;
  notes: string | null;
  photoUrl: string | null;
  recipes: {
    recipeId: string;
    name: string;
    servings: number;
    recipeServings: number;
    ingredients: SessionIngredient[];
  }[];
  tasks: { id: string; title: string; completed: boolean }[];
}

export async function getSession(id: string): Promise<SessionDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meal_prep_sessions")
    .select(
      `*, meal_prep_session_recipes (servings, recipes (id, name, servings,
         recipe_ingredients (amount, unit, sort_order, food_items (*)))),
       meal_prep_tasks (id, title, sort_order, completed)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Die Session konnte nicht geladen werden.", { cause: error });
  if (!data) return null;

  let photoUrl: string | null = null;
  if (data.proof_photo_url) {
    const { data: signed } = await supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUrl(data.proof_photo_url, SIGNED_URL_SECONDS);
    photoUrl = signed?.signedUrl ?? null;
  }

  return {
    id: data.id,
    date: data.date,
    coversTo: data.covers_to,
    status: data.status,
    startedAt: data.started_at,
    completedAt: data.completed_at,
    plannedPortions: data.planned_portions,
    completedPortions: data.completed_portions,
    durationMinutes: data.duration_minutes,
    estimatedMinutes: data.estimated_minutes,
    notes: data.notes,
    photoUrl,
    recipes: data.meal_prep_session_recipes.map((r) => ({
      recipeId: r.recipes.id,
      name: r.recipes.name,
      servings: r.servings,
      recipeServings: r.recipes.servings,
      ingredients: [...r.recipes.recipe_ingredients]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => ({
          name: i.food_items.name,
          amount: i.amount,
          unit: i.unit,
          food: i.food_items,
        })),
    })),
    tasks: [...data.meal_prep_tasks]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((t) => ({ id: t.id, title: t.title, completed: t.completed })),
  };
}
