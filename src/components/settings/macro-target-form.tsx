"use client";

import { useActionState } from "react";
import { saveDefaultMacroTarget } from "@/features/nutrition/actions";
import { MacroConsistencyHint } from "@/components/nutrition/macro-consistency-hint";
import { InputField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValues } from "@/hooks/use-form-values";
import { IDLE } from "@/lib/action-state";
import { FormFeedback } from "./form-feedback";

export interface MacroTargetValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
}

export function MacroTargetForm({ initial }: { initial: MacroTargetValues | null }) {
  const [state, action] = useActionState(saveDefaultMacroTarget, IDLE);
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const { values, field } = useFormValues({
    calories: initial?.calories.toString() ?? "",
    protein: initial?.protein.toString() ?? "",
    carbs: initial?.carbs.toString() ?? "",
    fat: initial?.fat.toString() ?? "",
    fiber: initial?.fiber?.toString() ?? "",
  });

  return (
    <form action={action} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Kalorien"
          type="number"
          inputMode="numeric"
          suffix="kcal"
          step={10}
          required
          errors={errors?.calories}
          {...field("calories")}
        />
        <InputField
          label="Protein"
          type="number"
          inputMode="decimal"
          suffix="g"
          required
          errors={errors?.protein}
          {...field("protein")}
        />
        <InputField
          label="Kohlenhydrate"
          type="number"
          inputMode="decimal"
          suffix="g"
          required
          errors={errors?.carbs}
          {...field("carbs")}
        />
        <InputField
          label="Fett"
          type="number"
          inputMode="decimal"
          suffix="g"
          required
          errors={errors?.fat}
          {...field("fat")}
        />
        <InputField
          label="Ballaststoffe (optional)"
          type="number"
          inputMode="decimal"
          suffix="g"
          errors={errors?.fiber}
          {...field("fiber")}
        />
      </div>
      <MacroConsistencyHint
        calories={Number(values.calories)}
        protein={Number(values.protein)}
        carbs={Number(values.carbs)}
        fat={Number(values.fat)}
      />
      <FormFeedback state={state} />
      <div>
        <SubmitButton pendingLabel="Speichern…">Ziele speichern</SubmitButton>
      </div>
    </form>
  );
}
