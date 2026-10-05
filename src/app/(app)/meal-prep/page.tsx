import { ChefHat, History } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { CreateSessionButton } from "@/components/meal-prep/create-session-button";
import { SessionCard } from "@/components/meal-prep/session-card";
import { StreakCard } from "@/components/meal-prep/streak-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/features/auth/session";
import { getCompletedSessionDates, listSessions } from "@/features/meal-prep/queries";
import { getUserPreferences } from "@/features/nutrition/queries";
import { getPlannedMeals } from "@/features/planning/queries";
import { addDays, formatShortDate, relativeDayLabel, todayIsoDate } from "@/lib/dates";
import { WEEKDAY_LABELS } from "@/lib/nutrition/labels";
import { aggregatePrepRecipes, upcomingPrepWindows } from "@/lib/meal-prep/session";
import { mealPrepStreak, weekHistory } from "@/lib/meal-prep/streaks";
import { formatNumber } from "@/lib/number-format";

export const metadata: Metadata = { title: "Meal Prep" };

const HISTORY_DAYS = 120;

export default async function MealPrepPage() {
  const user = await requireUser();
  const today = todayIsoDate();
  const prefs = await getUserPreferences(user.id);
  const prepWeekdays = prefs?.prep_weekdays ?? [];
  const windows = upcomingPrepWindows(today, prepWeekdays);
  const lastCovered = windows.at(-1)?.coversTo ?? today;

  const [sessions, completedDates, meals] = await Promise.all([
    listSessions(addDays(today, -HISTORY_DAYS), addDays(today, 14)),
    getCompletedSessionDates(),
    getPlannedMeals(today, lastCovered),
  ]);

  const openSessions = sessions.filter((s) => s.status !== "completed");
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const windowsWithoutSession = windows.filter((w) => !sessions.some((s) => s.date === w.date));

  return (
    <>
      <PageHeader
        title="Meal Prep"
        description={
          prepWeekdays.length
            ? `Deine Prep-Tage: ${prepWeekdays.map((d) => WEEKDAY_LABELS[d]?.long).join(", ")}`
            : undefined
        }
        actions={
          <Link href="/einstellungen#planung" className={buttonVariants({ variant: "outline" })}>
            Prep-Tage ändern
          </Link>
        }
      />

      <StreakCard
        streak={mealPrepStreak(completedDates, today)}
        history={weekHistory(completedDates, today)}
      />

      <section className="grid gap-3" aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className="text-lg font-semibold">
          Anstehend
        </h2>
        {!prepWeekdays.length ? (
          <EmptyState
            icon={ChefHat}
            title="Keine Meal-Prep-Tage festgelegt."
            action={
              <Link href="/einstellungen#planung" className={buttonVariants()}>
                Prep-Tage festlegen
              </Link>
            }
          />
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          {openSessions.map((s) => (
            <SessionCard key={s.id} session={s} today={today} />
          ))}
          {windowsWithoutSession.map((w) => {
            const recipes = aggregatePrepRecipes(meals, w);
            const portions = recipes.reduce((sum, r) => sum + r.servings, 0);
            return (
              <Card key={w.date}>
                <CardHeader>
                  <CardTitle>{relativeDayLabel(today, w.date)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Bereitet vor für {formatShortDate(w.date)} – {formatShortDate(w.coversTo)}
                  </p>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {recipes.length ? (
                    <ul className="grid gap-1 text-sm">
                      {recipes.map((r) => (
                        <li key={r.recipeId} className="flex justify-between gap-2">
                          <span>{r.recipeName}</span>
                          <span className="text-muted-foreground tabular-nums">
                            {formatNumber(r.servings, 2)} Portionen
                          </span>
                        </li>
                      ))}
                      <li className="flex justify-between gap-2 border-t pt-1 font-medium">
                        <span>Gesamt</span>
                        <span className="tabular-nums">{formatNumber(portions, 2)} Portionen</span>
                      </li>
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Für diesen Zeitraum ist noch nichts geplant.{" "}
                      <Link href="/woche" className="font-medium text-primary hover:underline">
                        Zum Wochenplan
                      </Link>
                    </p>
                  )}
                  <CreateSessionButton date={w.date} disabled={!recipes.length} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3" aria-labelledby="history-heading">
        <h2 id="history-heading" className="flex items-center gap-2 text-lg font-semibold">
          <History className="size-4" aria-hidden /> Historie
        </h2>
        {completedSessions.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {completedSessions.map((s) => (
              <SessionCard key={s.id} session={s} today={today} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Noch keine abgeschlossenen Sessions. Nach deinem ersten Meal Prep erscheint es hier –
            mit Foto als Erfolgsnachweis.
          </p>
        )}
      </section>
    </>
  );
}
