import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Food = Tables<"food_items">;

/** Escapes LIKE wildcards so user input is matched literally. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * Foods visible to the user (global catalog + own), own foods first.
 * RLS restricts the result to rows the user may read.
 */
export async function findFoods(options: {
  query?: string;
  ownerId?: string;
  limit?: number;
}): Promise<Food[]> {
  const supabase = await createClient();
  let request = supabase
    .from("food_items")
    .select("*")
    .order("user_id", { ascending: true, nullsFirst: false })
    .order("name")
    .limit(options.limit ?? 200);
  if (options.query) request = request.ilike("name", `%${escapeLike(options.query)}%`);
  if (options.ownerId) request = request.eq("user_id", options.ownerId);

  const { data, error } = await request;
  if (error) throw new Error("Lebensmittel konnten nicht geladen werden.", { cause: error });
  return data;
}

export async function getFood(id: string): Promise<Food | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("food_items").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("Lebensmittel konnte nicht geladen werden.", { cause: error });
  return data;
}
