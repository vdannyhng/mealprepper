import type { Allergen } from "@/lib/nutrition/labels";
import { onboardingSchema, type OnboardingInput } from "@/lib/validation/nutrition";
import { toFieldErrors, type FieldErrors } from "@/lib/validation/shared";
import type { Enums } from "@/types/database";

/** Raw wizard state. Number inputs are kept as strings until validation. */
export interface WizardState {
  goal: Enums<"goal_type"> | null;
  targets: { calories: string; protein: string; carbs: string; fat: string; fiber: string };
  body: {
    sex: Enums<"sex_type"> | "";
    age: string;
    weightKg: string;
    heightCm: string;
    activityLevel: Enums<"activity_level"> | "";
  };
  dietType: Enums<"diet_type">;
  prepWeekdays: number[];
  mealsPerDay: number;
  snacksPerDay: number;
  varietyLevel: Enums<"variety_level">;
  allergens: Allergen[];
  excludedFoods: string;
  likedFoods: string;
  dislikedFoods: string;
}

export const INITIAL_WIZARD_STATE: WizardState = {
  goal: null,
  targets: { calories: "", protein: "", carbs: "", fat: "", fiber: "" },
  body: { sex: "", age: "", weightKg: "", heightCm: "", activityLevel: "" },
  dietType: "omnivore",
  prepWeekdays: [7],
  mealsPerDay: 3,
  snacksPerDay: 1,
  varietyLevel: "medium",
  allergens: [],
  excludedFoods: "",
  likedFoods: "",
  dislikedFoods: "",
};

export const WIZARD_STEPS = [
  { title: "Was ist dein Ziel?", fields: ["goal"] },
  { title: "Deine Tagesziele", fields: ["targets", "body"] },
  { title: "Wie ernährst du dich?", fields: ["dietType"] },
  { title: "Wann machst du Meal Prep?", fields: ["prepWeekdays"] },
  { title: "Wie viele Mahlzeiten pro Tag?", fields: ["mealsPerDay", "snacksPerDay"] },
  { title: "Wie viel Abwechslung?", fields: ["varietyLevel"] },
  {
    title: "Allergien & Vorlieben",
    fields: ["allergens", "excludedFoods", "likedFoods", "dislikedFoods"],
  },
] as const;

/** "Pilze, Fisch\nSellerie" → ["Pilze", "Fisch", "Sellerie"] (trimmed, de-duplicated). */
export function parseFoodList(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of raw.split(/[,;\n]/)) {
    const name = part.trim();
    const key = name.toLowerCase();
    if (name && !seen.has(key)) {
      seen.add(key);
      result.push(name);
    }
  }
  return result;
}

/** Shape expected by onboardingSchema (strings are coerced and validated there). */
export function toOnboardingPayload(state: WizardState) {
  const blankToUndefined = <T extends string>(v: T | "") => (v === "" ? undefined : v);
  return {
    goal: state.goal ?? undefined,
    targets: state.targets,
    body: {
      sex: blankToUndefined(state.body.sex),
      age: state.body.age,
      weightKg: state.body.weightKg,
      heightCm: state.body.heightCm,
      activityLevel: blankToUndefined(state.body.activityLevel),
    },
    dietType: state.dietType,
    prepWeekdays: state.prepWeekdays,
    mealsPerDay: state.mealsPerDay,
    snacksPerDay: state.snacksPerDay,
    varietyLevel: state.varietyLevel,
    allergens: state.allergens,
    excludedFoods: parseFoodList(state.excludedFoods),
    likedFoods: parseFoodList(state.likedFoods),
    dislikedFoods: parseFoodList(state.dislikedFoods),
  };
}

export function validateWizard(
  state: WizardState,
): { ok: true; data: OnboardingInput } | { ok: false; errors: FieldErrors } {
  const result = onboardingSchema.safeParse(toOnboardingPayload(state));
  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, errors: toFieldErrors(result.error) };
}

/** Errors belonging to one wizard step (0-based index). */
export function stepErrors(errors: FieldErrors, step: number): FieldErrors {
  const prefixes: readonly string[] = WIZARD_STEPS[step]?.fields ?? [];
  return Object.fromEntries(
    Object.entries(errors).filter(([key]) =>
      prefixes.some((p) => key === p || key.startsWith(`${p}.`)),
    ),
  );
}

/** First step that has an error, or -1. */
export function firstInvalidStep(errors: FieldErrors): number {
  return WIZARD_STEPS.findIndex((_, i) => Object.keys(stepErrors(errors, i)).length > 0);
}
