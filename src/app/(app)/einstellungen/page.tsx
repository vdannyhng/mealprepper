import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MacroTargetForm } from "@/components/settings/macro-target-form";
import { ToleranceForm } from "@/components/settings/tolerance-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/auth/session";
import {
  getDefaultMacroTarget,
  getUserPreferences,
  toTolerances,
} from "@/features/nutrition/queries";

export const metadata: Metadata = { title: "Einstellungen" };

export default async function SettingsPage() {
  const user = await requireUser();
  const [target, prefs] = await Promise.all([
    getDefaultMacroTarget(user.id),
    getUserPreferences(user.id),
  ]);

  return (
    <>
      <PageHeader title="Einstellungen" />

      <Card>
        <CardHeader>
          <CardTitle>Ernährungsziele</CardTitle>
          <CardDescription>Deine täglichen Kalorien- und Makroziele.</CardDescription>
        </CardHeader>
        <CardContent>
          <MacroTargetForm
            initial={
              target
                ? {
                    calories: target.calories,
                    protein: target.protein,
                    carbs: target.carbs,
                    fat: target.fat,
                    fiber: target.fiber,
                  }
                : null
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Makro-Toleranzen</CardTitle>
          <CardDescription>
            Wie genau du deine Ziele treffen musst, damit ein Tag als erreicht gilt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToleranceForm initial={toTolerances(prefs)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Darstellung</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Helles / dunkles Design umschalten</span>
          <ThemeToggle />
        </CardContent>
      </Card>
    </>
  );
}
