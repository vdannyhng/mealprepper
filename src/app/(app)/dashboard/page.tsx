import { CalendarDays, ChefHat, Flame, ListChecks, UtensilsCrossed } from "lucide-react";
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
import { getCompletedSessionDates, listSessions } from "@/features/meal-prep/queries";
import { getPlannedMeals, getWeekMeals } from "@/features/planning/queries";
import { getProfile } from "@/features/profile/queries";
import { getDayLogsSince } from "@/features/today/queries";
import {
  addDays,
  formatLongDate,
  nextDateOnWeekdays,
  relativeDayLabel,
  startOfIsoWeek,
  todayIsoDate,
} from "@/lib/dates";
import { PREP_STATUS_LABELS } from "@/lib/meal-prep/labels";
import { mealPrepStreak, nutritionStreak } from "@/lib/meal-prep/streaks";
import { formatGrams, formatKcal } from "@/lib/nutrition/format";
import { MACRO_KEYS } from "@/lib/nutrition/macros";
import { SLOT_LABELS, SLOT_ORDER, dayNutrients, mealNutrients } from "@/lib/planning/week";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const today = todayIsoDate();
  const [profile, target, prefs, todaysMeals, weekMeals, sessions, completedDates, dayLogs] =
    await Promise.all([
      getProfile(user.id),
      getDefaultMacroTarget(user.id),
      getUserPreferences(user.id),
      getPlannedMeals(today, today),
      getWeekMeals(startOfIsoWeek(today)),
      listSessions(today, addDays(today, 7)),
      getCompletedSessionDates(),
      getDayLogsSince(addDays(today, -400)),
    ]);

  const nextPrep = nextDateOnWeekdays(today, prefs?.prep_weekdays ?? []);
  const tolerances = toTolerances(prefs);
  const planned = dayNutrients(todaysMeals, today);
  const upcoming = [...todaysMeals]
    .filter((m) => m.status === "planned" || m.status === "prepared")
    .sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot));
  const nextMeal = upcoming[0];
  const nextSession = nextPrep ? sessions.find((x) => x.date === nextPrep) : undefined;
  const prepStreak = mealPrepStreak(completedDates, today);
  const dayStreak = nutritionStreak(dayLogs, today);
  const weekRelevant = weekMeals.filter((m) => m.status !== "skipped");
  const weekPrepared = weekRelevant.filter(
    (m) => m.status === "prepared" || m.status === "eaten",
  ).length;

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
                  showStatus={todaysMeals.length > 0}
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
                <p className="text-2xl font-bold">{relativeDayLabel(today, nextPrep)}</p>
                <p className="text-sm text-muted-foreground">{formatLongDate(nextPrep)}</p>
                <p className="text-sm">
                  {nextSession
                    ? `${PREP_STATUS_LABELS[nextSession.status]} · ${nextSession.progress} % erledigt`
                    : "Noch keine Session erstellt"}
                </p>
                <Link
                  href={nextSession ? `/meal-prep/${nextSession.id}` : "/meal-prep"}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {nextSession ? "Session öffnen" : "Zu Meal Prep"}
                </Link>
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
          <CardContent className="grid gap-3">
            <div>
              <p className="text-2xl font-bold tabular-nums">
                🔥 {prepStreak.current} {prepStreak.current === 1 ? "Woche" : "Wochen"}
              </p>
              <p className="text-sm text-muted-foreground">
                Meal-Prep-Streak · Rekord {prepStreak.longest}
              </p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">
                {dayStreak.current} {dayStreak.current === 1 ? "Tag" : "Tage"} in Folge im
                Zielbereich
              </p>
              <p className="text-sm text-muted-foreground">Rekord {dayStreak.longest}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="size-4 text-primary" aria-hidden /> Wochenfortschritt
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <p className="text-2xl font-bold tabular-nums">
              {weekPrepared} / {weekRelevant.length}
            </p>
            <p className="text-sm text-muted-foreground">Mahlzeiten vorbereitet diese Woche</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="size-4 text-primary" aria-hidden /> Nächste Mahlzeit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextMeal ? (
              <div className="grid gap-1">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {SLOT_LABELS[nextMeal.slot]}
                </p>
                <Link
                  href={`/rezepte/${nextMeal.recipeId}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {nextMeal.recipeName}
                </Link>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {nextMeal.servings}× Portion · {formatKcal(mealNutrients(nextMeal).calories)} kcal
                  · {formatGrams(mealNutrients(nextMeal).protein)} g Protein
                </p>
                {upcoming.length > 1 ? (
                  <p className="text-sm text-muted-foreground">
                    Danach heute:{" "}
                    {upcoming
                      .slice(1)
                      .map((m) => m.recipeName)
                      .join(", ")}
                  </p>
                ) : null}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title={
                  todaysMeals.length
                    ? "Für heute ist nichts mehr offen."
                    : "Für heute sind noch keine Mahlzeiten geplant."
                }
                action={
                  <Link href="/woche" className={buttonVariants()}>
                    Zum Wochenplan
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
