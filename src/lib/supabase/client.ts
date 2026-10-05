import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/** Supabase client for Client Components (uses the anon key; RLS applies). */
export function createClient() {
  return createBrowserClient<Database>(publicEnv.supabaseUrl(), publicEnv.supabaseAnonKey());
}
