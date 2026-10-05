"use client";

import { CalendarDays, Check, CircleCheck, CircleX, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { MacroProgress } from "@/components/nutrition/macro-progress";
import { RecipePickerDialog } from "@/components/planner/recipe-picker-dialog";
import type { RecipeOption } from "@/components/planner/types";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { PlannedMeal } from "@/features/planning/queries";
import { completeDay, replaceMeal, setMealStatus, type DayResult } from "@/features/today/actions";
import type { IsoDate } from "@/lib/dates";
import { formatGrams, formatKcal } from "@/lib/nutrition/format";
import { MACRO_KEYS, type Macros } from "@/lib/nutrition/macros";
import type { MacroTolerances } from "@/lib/nutrition/tolerance";
import { dayProgress, eatenNutrients, type MealStatus } from "@/lib/planning/today";
import { SLOT_LABELS, SLOT_ORDER, dayNutrients, mealNutrients } from "@/lib/planning/week";
import { cn } from "@/lib/utils";

const STATUS_ACTIONS: { status: MealStatus; label: string }[] = [
  { status: "prepared", label: "Vorbereitet" },
  { status: "eaten", label: "Gegessen" },
  { status: "skipped", label: "Übersprungen" },
];

interface TodayViewProps {
  date: IsoDate;
  initialMeals: PlannedMeal[];
  recipes: RecipeOption[];
  target: Macros | null;
  tolerances: MacroTolerances;
  /** Result of an earlier "Tag abgeschlossen" for this date. */
  initialResult: { targetMet: boolean | null; completedLabel: string } | null;
}

export function TodayView({
  date,
  initialMeals,
  recipes,
  target,
  tolerances,
  initialResult,
}: TodayViewProps) {
  const [meals, setMeals] = useState(initialMeals);
  const [replacing, setReplacing] = useState<PlannedMeal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DayResult | null>(null);
  const [completing, startCompleting] = useTransition();

  const sorted = [...meals].sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot));
  const eaten = eatenNutrients(meals);
  const planned = dayNutrients(meals, date);
  const progress = dayProgress(meals);

  async function changeStatus(meal: PlannedMeal, status: MealStatus) {
    const next = meal.status === status ? "planned" : status;
    setError(null);
    setResult(null);
    setMeals((ms) => ms.map((m) => (m.id === meal.id ? { ...m, status: next } : m)));
    const res = await setMealStatus({ id: meal.id, status: next }).catch(() => null);
    if (!res?.ok) {
      setMeals((ms) => ms.map((m) => (m.id === meal.id ? meal : m)));
      setError(res?.message ?? "Keine Verbindung zum Server. Bitte erneut versuchen.");
    }
  }

  async function replace(meal: PlannedMeal, recipeId: string) {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe || recipe.id === meal.recipeId) return;
    setError(null);
    setResult(null);
    const updated: PlannedMeal = {
      ...meal,
      recipeId,
      recipeName: recipe.name,
      perServing: recipe.perServing,
      status: "planned",
    };
    setMeals((ms) => ms.map((m) => (m.id === meal.id ? updated : m)));
    const res = await replaceMeal({ id: meal.id, recipeId }).catch(() => null);
    if (!res?.ok) {
      setMeals((ms) => ms.map((m) => (m.id === meal.id ? meal : m)));
      setError(res?.message ?? "Keine Verbindung zum Server. Bitte erneut versuchen.");
    }
  }

  function finishDay() {
    setError(null);
    startCompleting(async () => {
      const res = await completeDay(date).catch(() => null);
      if (res?.ok) setResult(res.data);
      else setError(res?.message ?? "Keine Verbindung zum Server. Bitte erneut versuchen.");
    });
  }

  if (!meals.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Für heute sind noch keine Mahlzeiten geplant."
        description="Plane deine Mahlzeiten im Wochenplan – dann siehst du sie hier und kannst sie abhaken."
        action={
          <Link href="/woche" className={buttonVariants()}>
            Zum Wochenplan
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid content-start gap-4">
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">Tagesfortschritt</span>
            <span className="text-muted-foreground">
              {progress.eaten} / {progress.total} Mahlzeiten gegessen
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Tagesfortschritt"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <ul className="grid gap-3" aria-label="Mahlzeiten heute">
          {sorted.map((meal) => {
            const n = mealNutrients(meal);
            return (
              <li
                key={meal.id}
                className={cn(
                  "grid gap-3 rounded-xl border bg-card p-4",
                  meal.status === "eaten" && "border-status-met/50",
                  meal.status === "skipped" && "opacity-60",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="grid gap-0.5">
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {SLOT_LABELS[meal.slot]}
                    </span>
                    <Link
                      href={`/rezepte/${meal.recipeId}`}
                      className="font-semibold hover:underline"
                    >
                      {meal.recipeName}
                    </Link>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {meal.servings}× Portion · {formatKcal(n.calories)} kcal ·{" "}
                      {formatGrams(n.protein)} g P · {formatGrams(n.carbs)} g K ·{" "}
                      {formatGrams(n.fat)} g F
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setReplacing(meal)}>
                    <RefreshCw aria-hidden /> Ersetzen
                  </Button>
                </div>
                <div
                  role="group"
                  aria-label={`Status ${meal.recipeName}`}
                  className="flex flex-wrap gap-2"
                >
                  {STATUS_ACTIONS.map(({ status, label }) => (
                    <button
                      key={status}
                      type="button"
                      aria-pressed={meal.status === status}
                      onClick={() => changeStatus(meal, status)}
                      className={cn(
                        "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium",
                        meal.status === status
                          ? "border-primary bg-primary text-primary-foreground"
                          : "hover:bg-muted",
                      )}
                    >
                      {meal.status === status ? <Check className="size-3.5" aria-hidden /> : null}
                      {label}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="grid content-start gap-4 lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Gegessen</CardTitle>
            <CardDescription>
              Geplant: {formatKcal(planned.calories)} kcal · {formatGrams(planned.protein)} g
              Protein
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {target ? (
              MACRO_KEYS.map((key) => (
                <MacroProgress
                  key={key}
                  macro={key}
                  actual={eaten[key]}
                  target={target[key]}
                  tolerances={tolerances}
                  showStatus={progress.eaten > 0}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Keine Ernährungsziele hinterlegt.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tag abschliessen</CardTitle>
            <CardDescription>Prüft die gegessenen Mahlzeiten gegen deine Ziele.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {result ? (
              <ul className="grid gap-1.5 text-sm" aria-live="polite">
                <ResultLine ok={result.caloriesMet} label="Kalorienziel" />
                <ResultLine ok={result.proteinMet} label="Proteinziel" />
                <ResultLine ok={result.targetMet} label="Alle Makros im Toleranzbereich" />
              </ul>
            ) : initialResult ? (
              <p className="text-sm text-muted-foreground">
                {initialResult.completedLabel}:{" "}
                {initialResult.targetMet ? "Ziele erreicht ✓" : "Ziele nicht ganz erreicht"}
              </p>
            ) : null}
            <Button onClick={finishDay} disabled={completing || !target} aria-busy={completing}>
              {completing
                ? "Wird ausgewertet…"
                : result || initialResult
                  ? "Erneut auswerten"
                  : "Tag abgeschlossen"}
            </Button>
          </CardContent>
        </Card>
      </aside>

      <RecipePickerDialog
        target={
          replacing ? `${SLOT_LABELS[replacing.slot]} ersetzen: ${replacing.recipeName}` : null
        }
        recipes={recipes}
        onPick={(recipeId) => {
          if (replacing) void replace(replacing, recipeId);
          setReplacing(null);
        }}
        onClose={() => setReplacing(null)}
      />
    </div>
  );
}

function ResultLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      {ok ? (
        <CircleCheck className="size-4 text-status-met" aria-hidden />
      ) : (
        <CircleX className="size-4 text-status-over" aria-hidden />
      )}
      {label} {ok ? "erreicht" : "nicht erreicht"}
    </li>
  );
}
