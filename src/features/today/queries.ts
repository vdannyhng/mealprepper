import "server-only";
import type { IsoDate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type DayLog = Tables<"nutrition_day_logs">;

export async function getDayLog(date: IsoDate): Promise<DayLog | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("nutrition_day_logs")
    .select("*")
    .eq("date", date)
    .maybeSingle();
  if (error) throw new Error("Der Tagesabschluss konnte nicht geladen werden.", { cause: error });
  return data;
}

/** Completed days since `from`, for the nutrition adherence streak. */
export async function getDayLogsSince(from: IsoDate) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("nutrition_day_logs")
    .select("date, completed, target_met")
    .gte("date", from)
    .order("date");
  if (error) throw new Error("Die Tagesabschlüsse konnten nicht geladen werden.", { cause: error });
  return data.map((l) => ({ date: l.date, completed: l.completed, targetMet: l.target_met }));
}
