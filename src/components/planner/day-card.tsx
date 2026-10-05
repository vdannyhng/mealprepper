"use client";

import { Copy, Eraser } from "lucide-react";
import { MacroProgress } from "@/components/nutrition/macro-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { PlannedMeal } from "@/features/planning/queries";
import { formatLongDate, type IsoDate } from "@/lib/dates";
import { MACRO_KEYS, type Macros } from "@/lib/nutrition/macros";
import type { MacroTolerances } from "@/lib/nutrition/tolerance";
import type { DragPayload } from "@/lib/planning/dnd";
import { dayNutrients, type MealSlot } from "@/lib/planning/week";
import { cn } from "@/lib/utils";
import { SlotCell } from "./slot-cell";

const SLOT_GRID: Record<number, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
};

interface DayCardProps {
  date: IsoDate;
  isToday: boolean;
  slots: MealSlot[];
  meals: PlannedMeal[];
  target: Macros | null;
  tolerances: MacroTolerances;
  onAdd: (slot: MealSlot) => void;
  onDrop: (slot: MealSlot, payload: DragPayload) => void;
  onServings: (mealId: string, servings: number) => void;
  onRemove: (mealId: string) => void;
  onCopy: () => void;
  onClear: () => void;
}

export function DayCard({
  date,
  isToday,
  slots,
  meals,
  target,
  tolerances,
  onAdd,
  onDrop,
  onServings,
  onRemove,
  onCopy,
  onClear,
}: DayCardProps) {
  const label = formatLongDate(date);
  const totals = dayNutrients(meals, date);
  const hasMeals = meals.length > 0;

  return (
    <article
      aria-labelledby={`day-${date}`}
      className={cn(
        "grid gap-3 rounded-xl border bg-card p-3 sm:p-4",
        isToday && "border-primary/60",
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`day-${date}`} className="flex items-center gap-2 font-semibold">
          {label}
          {isToday ? <Badge>Heute</Badge> : null}
        </h3>
        {hasMeals ? (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onCopy}>
              <Copy aria-hidden /> Kopieren
            </Button>
            <ConfirmDialog
              triggerVariant="ghost"
              triggerLabel={
                <>
                  <Eraser aria-hidden /> Leeren
                </>
              }
              title={`${label} leeren?`}
              description="Alle Mahlzeiten dieses Tages werden aus dem Plan entfernt."
            >
              {(close) => (
                <Button
                  variant="destructive"
                  onClick={() => {
                    close();
                    onClear();
                  }}
                >
                  Tag leeren
                </Button>
              )}
            </ConfirmDialog>
          </div>
        ) : null}
      </header>

      <div className={cn("grid gap-2 sm:grid-cols-2", SLOT_GRID[slots.length])}>
        {slots.map((slot) => (
          <SlotCell
            key={slot}
            slot={slot}
            dayLabel={label}
            meals={meals.filter((m) => m.slot === slot)}
            onAdd={() => onAdd(slot)}
            onDrop={(payload) => onDrop(slot, payload)}
            onServings={onServings}
            onRemove={onRemove}
          />
        ))}
      </div>

      {target ? (
        <div className="grid gap-3 border-t pt-3 sm:grid-cols-2 lg:grid-cols-4">
          {MACRO_KEYS.map((key) => (
            <MacroProgress
              key={key}
              macro={key}
              actual={totals[key]}
              target={target[key]}
              tolerances={tolerances}
              showStatus={hasMeals}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
