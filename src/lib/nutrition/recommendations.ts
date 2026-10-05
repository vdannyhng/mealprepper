import type { Macros } from "./macros";

export type Goal = "fat_loss" | "maintenance" | "muscle_gain";
export type Sex = "female" | "male" | "diverse";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface BodyData {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
}

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_CALORIE_FACTOR: Record<Goal, number> = {
  fat_loss: 0.8,
  maintenance: 1,
  muscle_gain: 1.1,
};

/** Grams of protein per kg body weight. */
const PROTEIN_PER_KG: Record<Goal, number> = {
  fat_loss: 2.2,
  maintenance: 1.8,
  muscle_gain: 2.0,
};

const FAT_PER_KG = 0.8;
const MIN_FAT_ENERGY_SHARE = 0.2;

/** Basal metabolic rate (Mifflin-St Jeor). "diverse" uses the mean of both formulas. */
export function basalMetabolicRate({ sex, age, weightKg, heightCm }: BodyData): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const offset = sex === "male" ? 5 : sex === "female" ? -161 : -78;
  return base + offset;
}

export function totalDailyEnergyExpenditure(body: BodyData): number {
  return basalMetabolicRate(body) * ACTIVITY_FACTORS[body.activityLevel];
}

/**
 * Suggests daily targets from body data and goal. Calories are rounded to 10 kcal,
 * macros to whole grams; carbs fill the remaining energy.
 */
export function recommendMacroTargets(body: BodyData, goal: Goal): Macros {
  const calories =
    Math.round((totalDailyEnergyExpenditure(body) * GOAL_CALORIE_FACTOR[goal]) / 10) * 10;
  const protein = Math.round(body.weightKg * PROTEIN_PER_KG[goal]);
  const fat = Math.round(
    Math.max(body.weightKg * FAT_PER_KG, (calories * MIN_FAT_ENERGY_SHARE) / 9),
  );
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { calories, protein, carbs, fat };
}

export function ageFromBirthYear(birthYear: number, today: Date = new Date()): number {
  return today.getFullYear() - birthYear;
}

export function birthYearFromAge(age: number, today: Date = new Date()): number {
  return today.getFullYear() - age;
}
