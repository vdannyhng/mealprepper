"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { actionError, type ActionState } from "@/lib/action-state";
import { toUserMessage } from "@/lib/errors";
import { STORAGE_BUCKETS } from "@/lib/storage";
import { createClient, type ServerSupabaseClient } from "@/lib/supabase/server";

const PAGE_SIZE = 1000;

/** Removes every file below "<userId>/" in the given bucket (RLS limits this to own files). */
async function removeUserFiles(supabase: ServerSupabaseClient, bucket: string, userId: string) {
  for (;;) {
    const { data, error } = await supabase.storage.from(bucket).list(userId, { limit: PAGE_SIZE });
    if (error) throw error;
    if (!data.length) return;
    const paths = data.map((file) => `${userId}/${file.name}`);
    const { error: removeError } = await supabase.storage.from(bucket).remove(paths);
    if (removeError) throw removeError;
    if (data.length < PAGE_SIZE) return;
  }
}

/** Permanently deletes the signed-in user's account, files and all related data. */
export async function deleteAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (formData.get("confirmation") !== "LÖSCHEN") {
    return actionError("Bitte tippe LÖSCHEN ein, um die Löschung zu bestätigen.", {
      confirmation: ["Bitte tippe LÖSCHEN ein."],
    });
  }

  const supabase = await createClient();
  try {
    for (const bucket of STORAGE_BUCKETS) await removeUserFiles(supabase, bucket, user.id);
  } catch (error) {
    return actionError(toUserMessage(error, "Deine Dateien konnten nicht gelöscht werden."));
  }

  const { error } = await supabase.rpc("delete_own_account");
  if (error) return actionError(toUserMessage(error, "Dein Konto konnte nicht gelöscht werden."));

  await supabase.auth.signOut();
  redirect("/login?info=konto-geloescht");
}
