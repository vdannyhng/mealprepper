import { z } from "zod";

const email = z
  .string({ error: "E-Mail ist erforderlich." })
  .trim()
  .toLowerCase()
  .pipe(z.email("Bitte gib eine gültige E-Mail-Adresse ein."));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Passwort ist erforderlich."),
});

const newPassword = z
  .string()
  .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein.")
  .max(72, "Das Passwort darf höchstens 72 Zeichen lang sein.");

export const signUpSchema = z.object({
  displayName: z.string().trim().min(1, "Name ist erforderlich.").max(80, "Maximal 80 Zeichen."),
  email,
  password: newPassword,
});

export const magicLinkSchema = z.object({ email });

export const updatePasswordSchema = z
  .object({ password: newPassword, passwordConfirm: z.string() })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["passwordConfirm"],
  });

/** Only allow relative in-app redirects to prevent open redirects. */
export function safeRedirectPath(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
