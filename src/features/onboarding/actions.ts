"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { actionError, actionSuccess, type ActionState } from "@/lib/action-state";
import { toUserMessage } from "@/lib/errors";
import { birthYearFromAge } from "@/lib/nutrition/recommendations";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation/nutrition";
import { toFieldErrors } from "@/lib/validation/shared";

/** Persists all wizard answers in a single database transaction (RPC). */
export async function completeOnboarding(input: unknown): Promise<ActionState> {
  await requireUser();
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Bitte überprüfe deine Eingaben.", toFieldErrors(parsed.error));
  }

  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_onboarding", {
    p_goal: d.goal,
    p_calories: d.targets.calories,
    p_protein: d.targets.protein,
    p_carbs: d.targets.carbs,
    p_fat: d.targets.fat,
    p_fiber: d.targets.fiber ?? null,
    p_diet_type: d.dietType,
    p_prep_weekdays: [...new Set(d.prepWeekdays)].sort((a, b) => a - b),
    p_meals_per_day: d.mealsPerDay,
    p_snacks_per_day: d.snacksPerDay,
    p_variety_level: d.varietyLevel,
    p_allergens: d.allergens,
    p_excluded_foods: d.excludedFoods,
    p_liked_foods: d.likedFoods,
    p_disliked_foods: d.dislikedFoods,
    p_sex: d.body.sex ?? null,
    p_birth_year: d.body.age ? birthYearFromAge(d.body.age) : null,
    p_weight_kg: d.body.weightKg ?? null,
    p_height_cm: d.body.heightCm ?? null,
    p_activity_level: d.body.activityLevel ?? null,
  });
  if (error) return actionError(toUserMessage(error, "Das Setup konnte nicht gespeichert werden."));

  revalidatePath("/", "layout");
  return actionSuccess();
}
