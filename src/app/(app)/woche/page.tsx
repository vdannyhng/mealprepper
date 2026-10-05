import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { WeekNav } from "@/components/planner/week-nav";
import { WeekPlanner } from "@/components/planner/week-planner";
import { requireUser } from "@/features/auth/session";
import {
  getDefaultMacroTarget,
  getUserPreferences,
  toMacros,
  toTolerances,
} from "@/features/nutrition/queries";
import { getWeekMeals } from "@/features/planning/queries";
import { listRecipes } from "@/features/recipes/queries";
import { startOfIsoWeek, todayIsoDate } from "@/lib/dates";
import { parseWeekStart } from "@/lib/planning/week";

export const metadata: Metadata = { title: "Wochenplan" };

export default async function WeekPage({
  searchParams,
}: {
  searchParams: Promise<{ woche?: string | string[] }>;
}) {
  const user = await requireUser();
  const today = todayIsoDate();
  const weekStart = parseWeekStart((await searchParams).woche, today);

  const [meals, recipes, target, prefs] = await Promise.all([
    getWeekMeals(weekStart),
    listRecipes(user.id, { scope: "all" }),
    getDefaultMacroTarget(user.id),
    getUserPreferences(user.id),
  ]);

  return (
    <>
      <PageHeader
        title="Wochenplan"
        description="Plane deine Mahlzeiten – die Tagesmakros werden automatisch berechnet."
        actions={<WeekNav weekStart={weekStart} currentWeekStart={startOfIsoWeek(today)} />}
      />
      <WeekPlanner
        // A new week starts with fresh client state.
        key={weekStart}
        weekStart={weekStart}
        today={today}
        initialMeals={meals}
        recipes={recipes.map((r) => ({
          id: r.id,
          name: r.name,
          category: r.category,
          isOwn: r.isOwn,
          perServing: r.perServing,
        }))}
        target={target ? toMacros(target) : null}
        tolerances={toTolerances(prefs)}
        mealsPerDay={prefs?.meals_per_day ?? 3}
        snacksPerDay={prefs?.snacks_per_day ?? 1}
      />
    </>
  );
}
