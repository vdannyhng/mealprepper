import { z } from "zod";
import { ALLERGENS } from "@/lib/nutrition/labels";
import { Constants } from "@/types/database";
import { optionalNumber, requiredNumber } from "./shared";

const enums = Constants.public.Enums;

export const macroTargetSchema = z.object({
  calories: requiredNumber("Kalorien", { min: 800, max: 10000, int: true }),
  protein: requiredNumber("Protein", { min: 0, max: 1000 }),
  carbs: requiredNumber("Kohlenhydrate", { min: 0, max: 1500 }),
  fat: requiredNumber("Fett", { min: 0, max: 1000 }),
  fiber: optionalNumber("Ballaststoffe", { min: 0, max: 300 }),
});
export type MacroTargetInput = z.infer<typeof macroTargetSchema>;

export const toleranceSchema = z.object({
  caloriesPct: requiredNumber("Kalorien-Toleranz", { min: 0, max: 50 }),
  proteinMinPct: requiredNumber("Protein-Minimum", { min: 50, max: 100 }),
  carbsPct: requiredNumber("Kohlenhydrat-Toleranz", { min: 0, max: 50 }),
  fatPct: requiredNumber("Fett-Toleranz", { min: 0, max: 50 }),
});
export type ToleranceInput = z.infer<typeof toleranceSchema>;

export const bodyDataSchema = z.object({
  sex: z.enum(enums.sex_type).optional(),
  age: optionalNumber("Alter", { min: 14, max: 100, int: true }),
  weightKg: optionalNumber("Gewicht", { min: 30, max: 300 }),
  heightCm: optionalNumber("Körpergrösse", { min: 120, max: 230 }),
  activityLevel: z.enum(enums.activity_level).optional(),
});
export type BodyDataInput = z.infer<typeof bodyDataSchema>;

const foodNameList = z
  .array(z.string().trim().min(1).max(120, "Maximal 120 Zeichen pro Eintrag."))
  .max(50, "Maximal 50 Einträge.");

export const onboardingSchema = z.object({
  goal: z.enum(enums.goal_type, { error: "Bitte wähle ein Ziel." }),
  targets: macroTargetSchema,
  body: bodyDataSchema,
  dietType: z.enum(enums.diet_type, { error: "Bitte wähle eine Ernährungsform." }),
  prepWeekdays: z
    .array(z.number().int().min(1).max(7))
    .min(1, "Wähle mindestens einen Meal-Prep-Tag.")
    .max(7),
  mealsPerDay: requiredNumber("Hauptmahlzeiten", { min: 1, max: 6, int: true }),
  snacksPerDay: requiredNumber("Snacks", { min: 0, max: 4, int: true }),
  varietyLevel: z.enum(enums.variety_level, { error: "Bitte wähle ein Variety Level." }),
  allergens: z.array(z.enum(ALLERGENS)).max(ALLERGENS.length),
  excludedFoods: foodNameList,
  likedFoods: foodNameList,
  dislikedFoods: foodNameList,
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const planningPreferencesSchema = z.object({
  prepWeekdays: z
    .array(z.coerce.number().int().min(1).max(7))
    .min(1, "Wähle mindestens einen Meal-Prep-Tag.")
    .max(7),
  mealsPerDay: requiredNumber("Hauptmahlzeiten", { min: 1, max: 6, int: true }),
  snacksPerDay: requiredNumber("Snacks", { min: 0, max: 4, int: true }),
});
