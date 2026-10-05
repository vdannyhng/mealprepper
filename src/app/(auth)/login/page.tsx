import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { publicEnv } from "@/lib/env";
import { safeRedirectPath } from "@/lib/validation/auth";

export const metadata: Metadata = { title: "Anmelden" };

const ERRORS: Record<string, string> = {
  auth: "Der Link ist ungültig oder abgelaufen. Bitte melde dich erneut an.",
  oauth: "Die Anmeldung mit Google ist fehlgeschlagen.",
};

const INFOS: Record<string, string> = {
  "konto-geloescht": "Dein Konto und alle zugehörigen Daten wurden gelöscht.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; info?: string }>;
}) {
  const { next, error, info } = await searchParams;
  const errorMessage = error ? (ERRORS[error] ?? ERRORS.auth) : null;
  const infoMessage = info ? INFOS[info] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Willkommen zurück</CardTitle>
        <CardDescription>Melde dich an, um deine Woche zu planen.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}
        {infoMessage ? <Alert variant="success">{infoMessage}</Alert> : null}
        <LoginForm next={safeRedirectPath(next)} googleEnabled={publicEnv.googleAuthEnabled()} />
        <p className="text-center text-sm text-muted-foreground">
          Noch kein Konto?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Registrieren
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
