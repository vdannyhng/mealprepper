"use client";

import { GripVertical, LoaderCircle, X } from "lucide-react";
import type { PlannedMeal } from "@/features/planning/queries";
import { formatGrams, formatKcal } from "@/lib/nutrition/format";
import { writeDragPayload } from "@/lib/planning/dnd";
import { mealNutrients } from "@/lib/planning/week";
import { cn } from "@/lib/utils";

const SERVING_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3];

export function isTempId(id: string) {
  return id.startsWith("tmp-");
}

interface MealChipProps {
  meal: PlannedMeal;
  onServings: (servings: number) => void;
  onRemove: () => void;
}

/** A planned meal inside a slot: draggable to move, with servings and remove controls. */
export function MealChip({ meal, onServings, onRemove }: MealChipProps) {
  const saving = isTempId(meal.id);
  const nutrients = mealNutrients(meal);
  const options = SERVING_OPTIONS.includes(meal.servings)
    ? SERVING_OPTIONS
    : [...SERVING_OPTIONS, meal.servings].sort((a, b) => a - b);

  return (
    <li
      draggable={!saving}
      onDragStart={(e) => writeDragPayload(e.dataTransfer, { kind: "meal", mealId: meal.id })}
      className={cn(
        "group grid gap-1 rounded-md border bg-card p-2 text-sm shadow-xs",
        !saving && "cursor-grab active:cursor-grabbing",
        saving && "opacity-60",
      )}
    >
      <div className="flex items-start gap-1">
        <GripVertical
          className="mt-0.5 hidden size-3.5 shrink-0 text-muted-foreground lg:block"
          aria-hidden
        />
        <span className="min-w-0 flex-1 leading-snug font-medium break-words">
          {meal.recipeName}
        </span>
        {saving ? (
          <LoaderCircle
            className="size-4 shrink-0 animate-spin text-muted-foreground"
            aria-label="Wird gespeichert"
          />
        ) : (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`${meal.recipeName} entfernen`}
            className="-m-1 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {formatKcal(nutrients.calories)} kcal · {formatGrams(nutrients.protein)} g P
        </span>
        <select
          aria-label={`Portionen ${meal.recipeName}`}
          disabled={saving}
          value={meal.servings}
          onChange={(e) => onServings(Number(e.target.value))}
          className="rounded border bg-card px-1 py-0.5 text-xs text-foreground"
        >
          {options.map((s) => (
            <option key={s} value={s}>
              {s}× Portion
            </option>
          ))}
        </select>
      </div>
    </li>
  );
}
