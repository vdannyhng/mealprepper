"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { actionError, actionSuccess, type ActionState } from "@/lib/action-state";
import { publicEnv } from "@/lib/env";
import { toUserMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import {
  magicLinkSchema,
  safeRedirectPath,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/validation/auth";
import { toFieldErrors } from "@/lib/validation/shared";

/**
 * Absolute URL of the auth callback. Uses the configured site URL in production so links in
 * emails always point to the canonical domain; falls back to the request origin locally.
 */
async function callbackUrl(next: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL
    ? publicEnv.siteUrl()
    : ((await headers()).get("origin") ?? publicEnv.siteUrl());
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError("Bitte überprüfe deine Eingaben.", toFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return actionError(toUserMessage(error, "Anmeldung fehlgeschlagen."));

  redirect(safeRedirectPath(formData.get("next")));
}

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError("Bitte überprüfe deine Eingaben.", toFieldErrors(parsed.error));
  }

  const { email, password, displayName } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: await callbackUrl("/onboarding"),
    },
  });
  if (error) return actionError(toUserMessage(error, "Registrierung fehlgeschlagen."));

  // Email confirmation disabled → session exists immediately.
  if (data.session) redirect("/onboarding");

  return actionSuccess(
    "Fast geschafft! Wir haben dir eine E-Mail geschickt. Bestätige deine Adresse, um loszulegen.",
  );
}

export async function sendMagicLink(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = magicLinkSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError("Bitte überprüfe deine Eingaben.", toFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: await callbackUrl(safeRedirectPath(formData.get("next"))),
    },
  });
  // Unknown addresses fail with a 4xx; report success anyway so the form does not reveal
  // which addresses have an account. Rate limits and server errors are still surfaced.
  if (error && (error.status === 429 || (error.status ?? 500) >= 500)) {
    return actionError(toUserMessage(error));
  }
  return actionSuccess("Falls ein Konto existiert, haben wir dir einen Anmelde-Link geschickt.");
}

export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = magicLinkSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError("Bitte überprüfe deine Eingaben.", toFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: await callbackUrl("/passwort-neu"),
  });
  if (error && (error.status === 429 || (error.status ?? 500) >= 500)) {
    return actionError(toUserMessage(error));
  }
  return actionSuccess(
    "Falls ein Konto existiert, haben wir dir einen Link zum Zurücksetzen des Passworts geschickt.",
  );
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError("Bitte überprüfe deine Eingaben.", toFieldErrors(parsed.error));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") {
      return actionError("Das neue Passwort muss sich vom bisherigen unterscheiden.");
    }
    return actionError(toUserMessage(error, "Das Passwort konnte nicht geändert werden."));
  }
  redirect("/dashboard");
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  if (!publicEnv.googleAuthEnabled()) redirect("/login");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: await callbackUrl(safeRedirectPath(formData.get("next"))) },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
