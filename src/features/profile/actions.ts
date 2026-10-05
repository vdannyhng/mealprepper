"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { actionError, actionSuccess, type ActionState } from "@/lib/action-state";
import { toUserMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/profile";
import { toFieldErrors } from "@/lib/validation/shared";

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError("Bitte überprüfe deine Eingaben.", toFieldErrors(parsed.error));
  }

  const p = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: p.displayName,
      goal: p.goal ?? null,
      sex: p.sex ?? null,
      birth_year: p.birthYear ?? null,
      weight_kg: p.weightKg ?? null,
      height_cm: p.heightCm ?? null,
      activity_level: p.activityLevel ?? null,
    })
    .eq("user_id", user.id);
  if (error) return actionError(toUserMessage(error));

  revalidatePath("/", "layout");
  return actionSuccess("Profil gespeichert.");
}
