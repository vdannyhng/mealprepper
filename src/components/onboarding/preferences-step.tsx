"use client";

import { CheckboxChipGroup } from "@/components/ui/choice-group";
import { InputField } from "@/components/ui/field";
import { parseFoodList, type WizardState } from "@/features/onboarding/wizard";
import { ALLERGENS, ALLERGEN_LABELS } from "@/lib/nutrition/labels";
import type { FieldErrors } from "@/lib/validation/shared";

interface PreferencesStepProps {
  state: WizardState;
  errors: FieldErrors;
  onChange: (patch: Partial<WizardState>) => void;
}

const LIST_FIELDS = [
  {
    key: "likedFoods",
    label: "Mag ich",
    placeholder: "z. B. Chicken, Reis, Pasta, Skyr",
  },
  {
    key: "dislikedFoods",
    label: "Mag ich nicht",
    placeholder: "z. B. Pilze, Fisch, Sellerie",
  },
  {
    key: "excludedFoods",
    label: "Nicht verwenden (Unverträglichkeiten)",
    placeholder: "z. B. Fenchel, Koriander",
  },
] as const;

export function PreferencesStep({ state, errors, onChange }: PreferencesStepProps) {
  return (
    <div className="grid gap-6">
      <CheckboxChipGroup
        legend="Allergien und Unverträglichkeiten"
        options={ALLERGENS.map((a) => ({ value: a, label: ALLERGEN_LABELS[a] }))}
        values={state.allergens}
        onChange={(allergens) => onChange({ allergens })}
        error={errors.allergens?.[0]}
      />
      {LIST_FIELDS.map(({ key, label, placeholder }) => {
        const items = parseFoodList(state[key]);
        return (
          <div key={key} className="grid gap-2">
            <InputField
              label={label}
              placeholder={placeholder}
              hint="Mehrere Lebensmittel mit Komma trennen."
              value={state[key]}
              onChange={(e) => onChange({ [key]: e.target.value })}
              errors={
                errors[key] ?? Object.entries(errors).find(([k]) => k.startsWith(`${key}.`))?.[1]
              }
            />
            {items.length ? (
              <ul className="flex flex-wrap gap-1.5" aria-label={`${label}: erkannte Einträge`}>
                {items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
