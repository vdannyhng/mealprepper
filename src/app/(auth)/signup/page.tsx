import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Registrieren" };

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Konto erstellen</CardTitle>
        <CardDescription>In wenigen Minuten zu deinem Meal-Prep-System.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          Bereits registriert?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Anmelden
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
