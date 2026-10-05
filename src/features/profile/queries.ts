import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;

/** Profile of the signed-in user, or null if it does not exist (yet). */
export const getProfile = cache(async (userId: string): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Profil konnte nicht geladen werden.", { cause: error });
  return data;
});

export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return Boolean(profile?.onboarding_completed_at);
}
