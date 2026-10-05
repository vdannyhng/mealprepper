import type { Enums } from "@/types/database";

/** Must match the check constraint on user_preferences.allergens. */
export const ALLERGENS = [
  "gluten",
  "lactose",
  "nuts",
  "peanuts",
  "soy",
  "eggs",
  "fish",
  "shellfish",
  "sesame",
  "celery",
  "mustard",
] as const;
export type Allergen = (typeof ALLERGENS)[number];

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: "Gluten",
  lactose: "Laktose",
  nuts: "Nüsse",
  peanuts: "Erdnüsse",
  soy: "Soja",
  eggs: "Eier",
  fish: "Fisch",
  shellfish: "Krebstiere",
  sesame: "Sesam",
  celery: "Sellerie",
  mustard: "Senf",
};

export const GOAL_LABELS: Record<Enums<"goal_type">, { label: string; description: string }> = {
  fat_loss: { label: "Fat Loss", description: "Körperfett reduzieren, lean bleiben" },
  maintenance: { label: "Maintenance", description: "Gewicht halten, Leistung steigern" },
  muscle_gain: { label: "Muscle Gain", description: "Muskeln aufbauen mit leichtem Überschuss" },
};

export const DIET_LABELS: Record<Enums<"diet_type">, string> = {
  omnivore: "Omnivor",
  vegetarian: "Vegetarisch",
  vegan: "Vegan",
  pescatarian: "Pescetarisch",
};

export const VARIETY_LABELS: Record<
  Enums<"variety_level">,
  { label: string; description: string }
> = {
  low: { label: "Low Variety", description: "Wenige Rezepte, maximale Meal-Prep-Effizienz" },
  medium: { label: "Medium Variety", description: "2–3 Hauptgerichte pro Woche" },
  high: { label: "High Variety", description: "Möglichst unterschiedliche Gerichte" },
};

export const SEX_LABELS: Record<Enums<"sex_type">, string> = {
  female: "Weiblich",
  male: "Männlich",
  diverse: "Divers",
};

export const ACTIVITY_LABELS: Record<Enums<"activity_level">, string> = {
  sedentary: "Kaum aktiv (Bürojob, kein Training)",
  light: "Leicht aktiv (1–2× Training/Woche)",
  moderate: "Aktiv (3–4× Training/Woche)",
  active: "Sehr aktiv (5–6× Training/Woche)",
  very_active: "Extrem aktiv (körperliche Arbeit + Training)",
};

/** ISO weekday (1 = Monday) → label */
export const WEEKDAY_LABELS: Record<number, { short: string; long: string }> = {
  1: { short: "Mo", long: "Montag" },
  2: { short: "Di", long: "Dienstag" },
  3: { short: "Mi", long: "Mittwoch" },
  4: { short: "Do", long: "Donnerstag" },
  5: { short: "Fr", long: "Freitag" },
  6: { short: "Sa", long: "Samstag" },
  7: { short: "So", long: "Sonntag" },
};

export const MACRO_LABELS = {
  calories: { label: "Kalorien", unit: "kcal" },
  protein: { label: "Protein", unit: "g" },
  carbs: { label: "Kohlenhydrate", unit: "g" },
  fat: { label: "Fett", unit: "g" },
} as const;
