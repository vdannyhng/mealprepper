"use client";

import { useActionState, useState } from "react";
import { saveTolerances } from "@/features/nutrition/actions";
import { InputField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { IDLE } from "@/lib/action-state";
import type { MacroTolerances } from "@/lib/nutrition/tolerance";
import { FormFeedback } from "./form-feedback";

const FIELDS: {
  key: keyof MacroTolerances;
  label: string;
  min: number;
  hint?: string;
}[] = [
  { key: "caloriesPct", label: "Kalorien ±", min: 0 },
  {
    key: "proteinMinPct",
    label: "Protein mindestens",
    min: 50,
    hint: "Anteil des Proteinziels, ab dem es als erreicht gilt.",
  },
  { key: "carbsPct", label: "Kohlenhydrate ±", min: 0 },
  { key: "fatPct", label: "Fett ±", min: 0 },
];

export function ToleranceForm({ initial }: { initial: MacroTolerances }) {
  const [state, action] = useActionState(saveTolerances, IDLE);
  // Controlled inputs: React resets uncontrolled forms after an action, which would
  // discard the user's input when validation fails.
  const [values, setValues] = useState<Record<keyof MacroTolerances, string>>({
    caloriesPct: String(initial.caloriesPct),
    proteinMinPct: String(initial.proteinMinPct),
    carbsPct: String(initial.carbsPct),
    fatPct: String(initial.fatPct),
  });
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={action} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ key, label, min, hint }) => (
          <InputField
            key={key}
            label={label}
            name={key}
            type="number"
            inputMode="decimal"
            suffix="%"
            min={min}
            max={key === "proteinMinPct" ? 100 : 50}
            step={0.5}
            value={values[key]}
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            hint={hint}
            errors={errors?.[key]}
          />
        ))}
      </div>
      <FormFeedback state={state} />
      <div>
        <SubmitButton pendingLabel="Speichern…">Toleranzen speichern</SubmitButton>
      </div>
    </form>
  );
}
