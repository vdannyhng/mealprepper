"use client";

import { Plus } from "lucide-react";
import { useState, type DragEvent } from "react";
import type { PlannedMeal } from "@/features/planning/queries";
import { hasDragPayload, readDragPayload, type DragPayload } from "@/lib/planning/dnd";
import { SLOT_LABELS, type MealSlot } from "@/lib/planning/week";
import { cn } from "@/lib/utils";
import { MealChip } from "./meal-chip";

interface SlotCellProps {
  slot: MealSlot;
  dayLabel: string;
  meals: PlannedMeal[];
  onAdd: () => void;
  onDrop: (payload: DragPayload) => void;
  onServings: (mealId: string, servings: number) => void;
  onRemove: (mealId: string) => void;
}

/** One meal slot of a day. Accepts dropped recipes (add) and meals (move). */
export function SlotCell({
  slot,
  dayLabel,
  meals,
  onAdd,
  onDrop,
  onServings,
  onRemove,
}: SlotCellProps) {
  const [over, setOver] = useState(false);
  const label = SLOT_LABELS[slot];

  function handleDragOver(e: DragEvent) {
    if (!hasDragPayload(e.dataTransfer)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === "copy" ? "copy" : "move";
    if (!over) setOver(true);
  }

  function handleDragLeave(e: DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    const payload = readDragPayload(e.dataTransfer);
    if (payload) onDrop(payload);
  }

  return (
    <section
      aria-label={`${dayLabel}, ${label}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "grid min-h-24 content-start gap-1.5 rounded-lg border border-dashed p-2 transition-colors",
        over ? "border-primary bg-secondary" : "bg-muted/30",
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </h4>
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Rezept zu ${dayLabel}, ${label} hinzufügen`}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
      {meals.length ? (
        <ul className="grid gap-1.5">
          {meals.map((meal) => (
            <MealChip
              key={meal.id}
              meal={meal}
              onServings={(s) => onServings(meal.id, s)}
              onRemove={() => onRemove(meal.id)}
            />
          ))}
        </ul>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md py-2 text-xs text-muted-foreground hover:text-foreground"
          tabIndex={-1}
          aria-hidden
        >
          {over ? "Hier ablegen" : "Leer"}
        </button>
      )}
    </section>
  );
}
