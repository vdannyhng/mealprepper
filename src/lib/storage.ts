/** Private storage buckets (see supabase/migrations/*_storage.sql). Paths: "<user_id>/<file>". */
export const STORAGE_BUCKETS = ["meal-prep-photos", "recipe-images", "avatars"] as const;
export type StorageBucket = (typeof STORAGE_BUCKETS)[number];
