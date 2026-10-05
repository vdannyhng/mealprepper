"use client";

import { useActionState } from "react";
import { FormFeedback } from "@/components/settings/form-feedback";
import { InputField, SelectField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { createFood, updateFood } from "@/features/foods/actions";
import type { Food } from "@/features/foods/queries";
import { useFormValues } from "@/hooks/use-form-values";
import { IDLE } from "@/lib/action-state";
import { FOOD_CATEGORY_LABELS } from "@/lib/recipes/labels";

const str = (v: string | number | null | undefined) => (v == null ? "" : String(v));

export function FoodForm({ food }: { food?: Food }) {
  const [state, action] = useActionState(food ? updateFood.bind(null, food.id) : createFood, IDLE);
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const { values, field } = useFormValues({
    name: str(food?.name),
    brand: str(food?.brand),
    category: food?.category ?? "other",
    baseUnit: food?.base_unit ?? "g",
    baseAmount: str(food?.base_amount ?? 100),
    calories: str(food?.calories),
    protein: str(food?.protein),
    carbs: str(food?.carbs),
    fat: str(food?.fat),
    fiber: str(food?.fiber),
    gramsPerPiece: str(food?.grams_per_piece),
    gramsPerServing: str(food?.grams_per_serving),
  });
  const unit = values.baseUnit === "ml" ? "ml" : "g";
  const per = `pro ${values.baseAmount || "…"} ${unit}`;

  return (
    <form action={action} className="grid gap-6" noValidate>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-semibold">Allgemein</legend>
        <InputField
          label="Name"
          required
          maxLength={120}
          errors={errors?.name}
          {...field("name")}
        />
        <InputField
          label="Marke (optional)"
          maxLength={120}
          errors={errors?.brand}
          {...field("brand")}
        />
        <SelectField
          label="Kategorie"
          hint="Bestimmt die Gruppe in der Einkaufsliste."
          errors={errors?.category}
          {...field("category")}
        >
          {Object.entries(FOOD_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <div className="grid grid-cols-[1fr_6rem] gap-2">
          <InputField
            label="Nährwerte bezogen auf"
            type="number"
            inputMode="decimal"
            errors={errors?.baseAmount}
            {...field("baseAmount")}
          />
          <SelectField label="Einheit" errors={errors?.baseUnit} {...field("baseUnit")}>
            <option value="g">g</option>
            <option value="ml">ml</option>
          </SelectField>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-semibold">Nährwerte {per}</legend>
        <InputField
          label="Kalorien"
          type="number"
          inputMode="decimal"
          suffix="kcal"
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
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-semibold">Umrechnung (optional)</legend>
        <InputField
          label="Gewicht pro Stück"
          type="number"
          inputMode="decimal"
          suffix={unit}
          hint="Ermöglicht Mengen in „Stück“, z. B. 60 g pro Ei."
          errors={errors?.gramsPerPiece}
          {...field("gramsPerPiece")}
        />
        <InputField
          label="Gewicht pro Portion"
          type="number"
          inputMode="decimal"
          suffix={unit}
          hint="Ermöglicht Mengen in „Portion“, z. B. 30 g Whey."
          errors={errors?.gramsPerServing}
          {...field("gramsPerServing")}
        />
      </fieldset>

      <FormFeedback state={state} />
      <div>
        <SubmitButton pendingLabel="Speichern…">Lebensmittel speichern</SubmitButton>
      </div>
    </form>
  );
}
