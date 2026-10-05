"use client";

import { useActionState } from "react";
import { updateProfile } from "@/features/profile/actions";
import { InputField, SelectField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValues } from "@/hooks/use-form-values";
import { IDLE } from "@/lib/action-state";
import { ACTIVITY_LABELS, GOAL_LABELS, SEX_LABELS } from "@/lib/nutrition/labels";
import type { Tables } from "@/types/database";
import { FormFeedback } from "./form-feedback";

const str = (v: string | number | null | undefined) => (v == null ? "" : String(v));

export function ProfileForm({ profile }: { profile: Tables<"profiles"> }) {
  const [state, action] = useActionState(updateProfile, IDLE);
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const { field } = useFormValues({
    displayName: str(profile.display_name),
    goal: str(profile.goal),
    sex: str(profile.sex),
    birthYear: str(profile.birth_year),
    weightKg: str(profile.weight_kg),
    heightCm: str(profile.height_cm),
    activityLevel: str(profile.activity_level),
  });

  return (
    <form action={action} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Name"
          autoComplete="given-name"
          required
          maxLength={80}
          errors={errors?.displayName}
          {...field("displayName")}
        />
        <SelectField label="Ziel" errors={errors?.goal} {...field("goal")}>
          <option value="">Keine Angabe</option>
          {Object.entries(GOAL_LABELS).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <SelectField label="Geschlecht (optional)" errors={errors?.sex} {...field("sex")}>
          <option value="">Keine Angabe</option>
          {Object.entries(SEX_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <InputField
          label="Geburtsjahr (optional)"
          type="number"
          inputMode="numeric"
          min={1920}
          errors={errors?.birthYear}
          {...field("birthYear")}
        />
        <InputField
          label="Körpergewicht (optional)"
          type="number"
          inputMode="decimal"
          step={0.1}
          suffix="kg"
          errors={errors?.weightKg}
          {...field("weightKg")}
        />
        <InputField
          label="Körpergrösse (optional)"
          type="number"
          inputMode="decimal"
          step={0.5}
          suffix="cm"
          errors={errors?.heightCm}
          {...field("heightCm")}
        />
        <SelectField
          label="Aktivitätslevel (optional)"
          className="sm:col-span-2"
          errors={errors?.activityLevel}
          {...field("activityLevel")}
        >
          <option value="">Keine Angabe</option>
          {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
      </div>
      <FormFeedback state={state} />
      <div>
        <SubmitButton pendingLabel="Speichern…">Profil speichern</SubmitButton>
      </div>
    </form>
  );
}
