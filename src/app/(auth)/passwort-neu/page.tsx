import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/auth/session";

export const metadata: Metadata = { title: "Neues Passwort" };

/** Reached via the password-reset email (the callback route signs the user in first). */
export default async function UpdatePasswordPage() {
  await requireUser();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Neues Passwort festlegen</CardTitle>
        <CardDescription>Wähle ein Passwort mit mindestens 8 Zeichen.</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdatePasswordForm />
      </CardContent>
    </Card>
  );
}
