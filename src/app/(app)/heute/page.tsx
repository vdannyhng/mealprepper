import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { TodayView } from "@/components/today/today-view";
import { requireUser } from "@/features/auth/session";
import {
  getDefaultMacroTarget,
  getUserPreferences,
  toMacros,
  toTolerances,
} from "@/features/nutrition/queries";
import { getPlannedMeals } from "@/features/planning/queries";
import { listRecipeOptions } from "@/features/recipes/queries";
import { getDayLog } from "@/features/today/queries";
import { formatDateTime, formatLongDate, todayIsoDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Heute" };

export default async function TodayPage() {
  const user = await requireUser();
  const today = todayIsoDate();
  const [meals, recipes, target, prefs, log] = await Promise.all([
    getPlannedMeals(today, today),
    listRecipeOptions(user.id),
    getDefaultMacroTarget(user.id),
    getUserPreferences(user.id),
    getDayLog(today),
  ]);

  return (
    <>
      <PageHeader title="Heute" description={formatLongDate(today)} />
      <TodayView
        date={today}
        initialMeals={meals}
        recipes={recipes}
        target={target ? toMacros(target) : null}
        tolerances={toTolerances(prefs)}
        initialResult={
          log?.completed
            ? {
                targetMet: log.target_met,
                completedLabel: `Abgeschlossen ${formatDateTime(log.updated_at)}`,
              }
            : null
        }
      />
    </>
  );
}
