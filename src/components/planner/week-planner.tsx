"use client";

import { CalendarDays, CircleCheck, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { PlannedMeal } from "@/features/planning/queries";
import { formatLongDate, type IsoDate } from "@/lib/dates";
import type { Macros } from "@/lib/nutrition/macros";
import type { MacroTolerances } from "@/lib/nutrition/tolerance";
import {
  SLOT_LABELS,
  summarizeWeek,
  visibleSlots,
  weekDates,
  type MealSlot,
} from "@/lib/planning/week";
import { CopyDayDialog } from "./copy-day-dialog";
import { DayCard } from "./day-card";
import { RecipeLibrary } from "./recipe-library";
import { RecipePickerDialog } from "./recipe-picker-dialog";
import type { RecipeOption } from "./types";
import { useWeekPlan } from "./use-week-plan";
import { WeekSummaryStats } from "./week-summary";

interface WeekPlannerProps {
  weekStart: IsoDate;
  today: IsoDate;
  initialMeals: PlannedMeal[];
  recipes: RecipeOption[];
  target: Macros | null;
  tolerances: MacroTolerances;
  mealsPerDay: number;
  snacksPerDay: number;
}

export function WeekPlanner({
  weekStart,
  today,
  initialMeals,
  recipes,
  target,
  tolerances,
  mealsPerDay,
  snacksPerDay,
}: WeekPlannerProps) {
  const plan = useWeekPlan(weekStart, initialMeals, recipes);
  const [picker, setPicker] = useState<{ date: IsoDate; slot: MealSlot } | null>(null);
  const [copyFrom, setCopyFrom] = useState<IsoDate | null>(null);
  const [copying, setCopying] = useState(false);

  const dates = weekDates(weekStart);
  const slots = visibleSlots(
    mealsPerDay,
    snacksPerDay,
    plan.meals.map((m) => m.slot),
  );
  const summary = summarizeWeek(dates, plan.meals, target, tolerances);
  const firstDay = dates.includes(today) ? today : weekStart;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid min-w-0 content-start gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            <span className="hidden lg:inline">Rezepte von rechts in einen Slot ziehen oder </span>
            <span className="lg:hidden">Tippe </span>
            auf <strong className="font-semibold text-foreground">+</strong>
            <span className="hidden lg:inline"> klicken</span> – Mahlzeiten lassen sich zwischen
            Slots verschieben.
          </p>
          <p aria-live="polite" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {plan.saving ? (
              <>
                <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> Speichert…
              </>
            ) : (
              <>
                <CircleCheck className="size-3.5 text-status-met" aria-hidden /> Automatisch
                gespeichert
              </>
            )}
          </p>
        </div>

        {plan.error ? (
          <Alert variant="error">
            <span className="flex items-start justify-between gap-2">
              {plan.error}
              <button type="button" onClick={plan.dismissError} aria-label="Meldung schliessen">
                <X className="size-4" aria-hidden />
              </button>
            </span>
          </Alert>
        ) : null}

        <WeekSummaryStats summary={summary} hasTarget={Boolean(target)} />

        {summary.mealCount === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Für diese Woche sind noch keine Mahlzeiten geplant."
            description="Plane einen Tag und kopiere ihn danach auf die restliche Woche – so ist dein Meal Prep in wenigen Minuten geplant."
            action={
              <Button
                onClick={() =>
                  setPicker({ date: firstDay, slot: slots.includes("lunch") ? "lunch" : slots[0]! })
                }
              >
                Erstes Rezept hinzufügen
              </Button>
            }
          />
        ) : null}

        {dates.map((date) => (
          <DayCard
            key={date}
            date={date}
            isToday={date === today}
            slots={slots}
            meals={plan.meals.filter((m) => m.date === date)}
            target={target}
            tolerances={tolerances}
            onAdd={(slot) => setPicker({ date, slot })}
            onDrop={(slot, payload) =>
              payload.kind === "recipe"
                ? void plan.add(date, slot, payload.recipeId)
                : plan.move(payload.mealId, date, slot)
            }
            onServings={plan.setServings}
            onRemove={plan.remove}
            onCopy={() => setCopyFrom(date)}
            onClear={() => plan.clearDay(date)}
          />
        ))}
      </div>

      <RecipeLibrary recipes={recipes} />

      <RecipePickerDialog
        target={picker ? `${formatLongDate(picker.date)} · ${SLOT_LABELS[picker.slot]}` : null}
        recipes={recipes}
        onPick={(recipeId) => {
          if (picker) void plan.add(picker.date, picker.slot, recipeId);
          setPicker(null);
        }}
        onClose={() => setPicker(null)}
      />

      <CopyDayDialog
        from={copyFrom}
        dates={dates}
        busy={copying}
        onClose={() => setCopyFrom(null)}
        onCopy={async (to, replace) => {
          if (!copyFrom) return;
          setCopying(true);
          const ok = await plan.copyDay(copyFrom, to, replace);
          setCopying(false);
          if (ok) setCopyFrom(null);
        }}
      />
    </div>
  );
}
