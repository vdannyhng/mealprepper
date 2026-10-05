"use client";

import { useActionState, useState } from "react";
import { CheckboxChipGroup, RadioChipGroup } from "@/components/ui/choice-group";
import { SubmitButton } from "@/components/ui/submit-button";
import { savePlanningPreferences } from "@/features/nutrition/actions";
import { IDLE } from "@/lib/action-state";
import { WEEKDAY_LABELS } from "@/lib/nutrition/labels";
import { FormFeedback } from "./form-feedback";

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7].map((d) => ({ value: d, label: WEEKDAY_LABELS[d]!.short }));
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => ({ value: from + i, label: String(from + i) }));

interface PlanningFormProps {
  prepWeekdays: number[];
  mealsPerDay: number;
  snacksPerDay: number;
}

export function PlanningForm(initial: PlanningFormProps) {
  const [state, action] = useActionState(savePlanningPreferences, IDLE);
  const [prepWeekdays, setPrepWeekdays] = useState(initial.prepWeekdays);
  const [mealsPerDay, setMealsPerDay] = useState(initial.mealsPerDay);
  const [snacksPerDay, setSnacksPerDay] = useState(initial.snacksPerDay);
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={action} className="grid gap-5" noValidate>
      {/* Chip groups are controlled; the values are submitted via hidden inputs. */}
      {prepWeekdays.map((d) => (
        <input key={d} type="hidden" name="prepWeekdays" value={d} />
      ))}
      <input type="hidden" name="mealsPerDay" value={mealsPerDay} />
      <input type="hidden" name="snacksPerDay" value={snacksPerDay} />

      <CheckboxChipGroup
        legend="Meal-Prep-Tage"
        options={WEEKDAYS}
        values={prepWeekdays}
        onChange={setPrepWeekdays}
        error={errors?.prepWeekdays?.[0]}
      />
      <RadioChipGroup
        legend="Hauptmahlzeiten pro Tag"
        name="mealsPerDayChoice"
        options={range(1, 6)}
        value={mealsPerDay}
        onChange={setMealsPerDay}
      />
      <RadioChipGroup
        legend="Snacks pro Tag"
        name="snacksPerDayChoice"
        options={range(0, 4)}
        value={snacksPerDay}
        onChange={setSnacksPerDay}
      />
      <FormFeedback state={state} />
      <div>
        <SubmitButton pendingLabel="Speichern…">Planung speichern</SubmitButton>
      </div>
    </form>
  );
}
