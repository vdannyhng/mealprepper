/**
 * Maps technical errors (Postgres, PostgREST, Supabase Auth) to messages users understand.
 * Never surface raw database errors in the UI.
 */

interface ErrorLike {
  code?: string;
  message?: string;
  status?: number;
}

const POSTGRES_MESSAGES: Record<string, string> = {
  "23505": "Dieser Eintrag existiert bereits.",
  "23503": "Dieser Eintrag wird noch an anderer Stelle verwendet.",
  "23514": "Einige Werte liegen ausserhalb des erlaubten Bereichs.",
  "23502": "Es fehlen Pflichtangaben.",
  "22P02": "Ein Wert hat ein ungültiges Format.",
  "42501": "Dafür fehlt dir die Berechtigung. Bitte melde dich erneut an.",
  PGRST116: "Der Eintrag wurde nicht gefunden.",
  PGRST301: "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
};

const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: "E-Mail oder Passwort ist falsch.",
  email_not_confirmed: "Bitte bestätige zuerst deine E-Mail-Adresse.",
  user_already_exists: "Für diese E-Mail-Adresse existiert bereits ein Konto.",
  email_exists: "Für diese E-Mail-Adresse existiert bereits ein Konto.",
  weak_password: "Das Passwort ist zu schwach. Verwende mindestens 8 Zeichen.",
  over_email_send_rate_limit: "Zu viele E-Mails angefordert. Bitte warte kurz.",
  over_request_rate_limit: "Zu viele Versuche. Bitte warte einen Moment.",
  signup_disabled: "Registrierungen sind derzeit deaktiviert.",
  otp_expired: "Der Link ist abgelaufen. Bitte fordere einen neuen an.",
  validation_failed: "Bitte überprüfe deine Eingaben.",
  session_not_found: "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
};

export const GENERIC_ERROR = "Etwas ist schiefgelaufen. Bitte versuche es erneut.";

export function toUserMessage(error: unknown, fallback = GENERIC_ERROR): string {
  if (!error || typeof error !== "object") return fallback;
  const { code, message } = error as ErrorLike;

  if (code && POSTGRES_MESSAGES[code]) return POSTGRES_MESSAGES[code];
  if (code && AUTH_MESSAGES[code]) return AUTH_MESSAGES[code];
  if (message && /fetch failed|network/i.test(message)) {
    return "Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung.";
  }
  return fallback;
}
