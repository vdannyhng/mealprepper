"use client";

import { Calculator } from "lucide-react";
import { MacroConsistencyHint } from "@/components/nutrition/macro-consistency-hint";
import { Button } from "@/components/ui/button";
import { InputField, SelectField } from "@/components/ui/field";
import type { WizardState } from "@/features/onboarding/wizard";
import { ACTIVITY_LABELS, SEX_LABELS } from "@/lib/nutrition/labels";
import { recommendMacroTargets } from "@/lib/nutrition/recommendations";
import { bodyDataSchema } from "@/lib/validation/nutrition";
import type { FieldErrors } from "@/lib/validation/shared";

interface MacroStepProps {
  state: WizardState;
  errors: FieldErrors;
  onChange: (patch: Partial<WizardState>) => void;
}

const TARGET_FIELDS = [
  { key: "calories", label: "Kalorien", suffix: "kcal" },
  { key: "protein", label: "Protein", suffix: "g" },
  { key: "carbs", label: "Kohlenhydrate", suffix: "g" },
  { key: "fat", label: "Fett", suffix: "g" },
  { key: "fiber", label: "Ballaststoffe (optional)", suffix: "g" },
] as const;

export function MacroStep({ state, errors, onChange }: MacroStepProps) {
  const setTarget = (key: keyof WizardState["targets"], value: string) =>
    onChange({ targets: { ...state.targets, [key]: value } });
  const setBody = (patch: Partial<WizardState["body"]>) =>
    onChange({ body: { ...state.body, ...patch } });

  const body = bodyDataSchema.safeParse({
    ...state.body,
    sex: state.body.sex || undefined,
    activityLevel: state.body.activityLevel || undefined,
  });
  const b = body.success ? body.data : null;
  const canSuggest = Boolean(
    state.goal && b?.sex && b.age && b.weightKg && b.heightCm && b.activityLevel,
  );

  function applySuggestion() {
    if (!state.goal || !b?.sex || !b.age || !b.weightKg || !b.heightCm || !b.activityLevel) return;
    const s = recommendMacroTargets(
      {
        sex: b.sex,
        age: b.age,
        weightKg: b.weightKg,
        heightCm: b.heightCm,
        activityLevel: b.activityLevel,
      },
      state.goal,
    );
    onChange({
      targets: {
        ...state.targets,
        calories: String(s.calories),
        protein: String(s.protein),
        carbs: String(s.carbs),
        fat: String(s.fat),
      },
    });
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {TARGET_FIELDS.map(({ key, label, suffix }) => (
          <InputField
            key={key}
            label={label}
            name={key}
            type="number"
            inputMode={key === "calories" ? "numeric" : "decimal"}
            suffix={suffix}
            required={key !== "fiber"}
            value={state.targets[key]}
            onChange={(e) => setTarget(key, e.target.value)}
            errors={errors[`targets.${key}`]}
          />
        ))}
      </div>
      <MacroConsistencyHint
        calories={Number(state.targets.calories)}
        protein={Number(state.targets.protein)}
        carbs={Number(state.targets.carbs)}
        fat={Number(state.targets.fat)}
      />

      <details className="group rounded-lg border bg-muted/40 p-4">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <Calculator className="size-4 text-primary" aria-hidden />
          Unsicher? Vorschlag aus Körperdaten berechnen
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Geschlecht"
            value={state.body.sex}
            onChange={(e) => setBody({ sex: e.target.value as WizardState["body"]["sex"] })}
          >
            <option value="">Bitte wählen</option>
            {Object.entries(SEX_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
          <InputField
            label="Alter"
            type="number"
            inputMode="numeric"
            suffix="Jahre"
            value={state.body.age}
            onChange={(e) => setBody({ age: e.target.value })}
            errors={errors["body.age"]}
          />
          <InputField
            label="Körpergewicht"
            type="number"
            inputMode="decimal"
            suffix="kg"
            value={state.body.weightKg}
            onChange={(e) => setBody({ weightKg: e.target.value })}
            errors={errors["body.weightKg"]}
          />
          <InputField
            label="Körpergrösse"
            type="number"
            inputMode="decimal"
            suffix="cm"
            value={state.body.heightCm}
            onChange={(e) => setBody({ heightCm: e.target.value })}
            errors={errors["body.heightCm"]}
          />
          <SelectField
            label="Aktivitätslevel"
            className="sm:col-span-2"
            value={state.body.activityLevel}
            onChange={(e) =>
              setBody({ activityLevel: e.target.value as WizardState["body"]["activityLevel"] })
            }
          >
            <option value="">Bitte wählen</option>
            {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
          <div className="grid gap-2 sm:col-span-2">
            <Button variant="secondary" onClick={applySuggestion} disabled={!canSuggest}>
              Vorschlag übernehmen
            </Button>
            <p className="text-xs text-muted-foreground">
              Schätzung nach Mifflin-St Jeor, angepasst an dein Ziel. Du kannst die Werte danach
              frei anpassen. Die Körperdaten werden in deinem Profil gespeichert.
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
