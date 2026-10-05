import "server-only";
import { cache } from "react";
import type { Macros } from "@/lib/nutrition/macros";
import { DEFAULT_TOLERANCES, type MacroTolerances } from "@/lib/nutrition/tolerance";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type MacroTarget = Tables<"macro_targets">;
export type UserPreferences = Tables<"user_preferences">;

export const getDefaultMacroTarget = cache(async (userId: string): Promise<MacroTarget | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("macro_targets")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();
  if (error) throw new Error("Ernährungsziele konnten nicht geladen werden.", { cause: error });
  return data;
});

export const getUserPreferences = cache(async (userId: string): Promise<UserPreferences | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Einstellungen konnten nicht geladen werden.", { cause: error });
  return data;
});

export function toMacros(target: MacroTarget): Macros {
  return {
    calories: target.calories,
    protein: target.protein,
    carbs: target.carbs,
    fat: target.fat,
  };
}

export function toTolerances(prefs: UserPreferences | null): MacroTolerances {
  if (!prefs) return DEFAULT_TOLERANCES;
  return {
    caloriesPct: prefs.tolerance_calories_pct,
    proteinMinPct: prefs.tolerance_protein_min_pct,
    carbsPct: prefs.tolerance_carbs_pct,
    fatPct: prefs.tolerance_fat_pct,
  };
}
