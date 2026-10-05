import { CalendarDays, ChefHat, Flame, UtensilsCrossed } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { MacroProgress } from "@/components/nutrition/macro-progress";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/features/auth/session";
import {
  getDefaultMacroTarget,
  getUserPreferences,
  toMacros,
  toTolerances,
} from "@/features/nutrition/queries";
import { getProfile } from "@/features/profile/queries";
import { daysBetween, formatLongDate, nextDateOnWeekdays, todayIsoDate } from "@/lib/dates";
import { MACRO_KEYS, ZERO_MACROS } from "@/lib/nutrition/macros";

export const metadata: Metadata = { title: "Dashboard" };

function relativeDayLabel(days: number): string {
  if (days === 0) return "Heute";
  if (days === 1) return "Morgen";
  return `In ${days} Tagen`;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [profile, target, prefs] = await Promise.all([
    getProfile(user.id),
    getDefaultMacroTarget(user.id),
    getUserPreferences(user.id),
  ]);

  const today = todayIsoDate();
  const nextPrep = nextDateOnWeekdays(today, prefs?.prep_weekdays ?? []);
  const tolerances = toTolerances(prefs);
  // Planned values come from the weekly plan once the planner is implemented.
  const planned = ZERO_MACROS;

  return (
    <>
      <PageHeader
        title={profile?.display_name ? `Hallo ${profile.display_name}` : "Dashboard"}
        description={formatLongDate(today)}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="md:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle>Heute</CardTitle>
            <CardDescription>Geplant vs. Tagesziel</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {target ? (
              MACRO_KEYS.map((key) => (
                <MacroProgress
                  key={key}
                  macro={key}
                  actual={planned[key]}
                  target={toMacros(target)[key]}
                  tolerances={tolerances}
                  showStatus={false}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground sm:col-span-2">
                Noch keine Ernährungsziele hinterlegt.{" "}
                <Link href="/einstellungen" className="font-medium text-primary hover:underline">
                  Jetzt festlegen
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="size-4 text-primary" aria-hidden /> Nächstes Meal Prep
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextPrep ? (
              <div className="grid gap-1">
                <p className="text-2xl font-bold">
                  {relativeDayLabel(daysBetween(today, nextPrep))}
                </p>
                <p className="text-sm text-muted-foreground">{formatLongDate(nextPrep)}</p>
                <p className="text-sm text-muted-foreground">Status: noch nicht geplant</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Meal-Prep-Tage festgelegt.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="size-4 text-primary" aria-hidden /> Streaks
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1">
            <p className="text-sm text-muted-foreground">
              Schliesse deine erste Meal-Prep-Session ab, um deine Streak zu starten.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="size-4 text-primary" aria-hidden /> Nächste Mahlzeit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={CalendarDays}
              title="Für diese Woche sind noch keine Mahlzeiten geplant."
              action={
                <Link href="/woche" className={buttonVariants()}>
                  Erstes Rezept hinzufügen
                </Link>
              }
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
