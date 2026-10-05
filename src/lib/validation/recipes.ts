import { z } from "zod";
import { RECIPE_TAGS } from "@/lib/recipes/labels";
import { Constants } from "@/types/database";
import { optionalEnum, optionalNumber, optionalText, requiredNumber } from "./shared";

const enums = Constants.public.Enums;

export const foodSchema = z
  .object({
    name: z.string().trim().min(1, "Name ist erforderlich.").max(120, "Maximal 120 Zeichen."),
    brand: optionalText(120),
    category: z.enum(enums.food_category, { error: "Bitte wähle eine Kategorie." }),
    baseUnit: z.enum(["g", "ml"], { error: "Bitte wähle g oder ml." }),
    baseAmount: requiredNumber("Bezugsmenge", { min: 1, max: 10000 }),
    calories: requiredNumber("Kalorien", { min: 0, max: 9000 }),
    protein: requiredNumber("Protein", { min: 0, max: 10000 }),
    carbs: requiredNumber("Kohlenhydrate", { min: 0, max: 10000 }),
    fat: requiredNumber("Fett", { min: 0, max: 10000 }),
    fiber: optionalNumber("Ballaststoffe", { min: 0, max: 10000 }),
    gramsPerPiece: optionalNumber("Gewicht pro Stück", { min: 0.1, max: 10000 }),
    gramsPerServing: optionalNumber("Gewicht pro Portion", { min: 0.1, max: 10000 }),
  })
  .refine((f) => f.baseUnit !== "g" || f.protein + f.carbs + f.fat <= f.baseAmount * 1.01, {
    message:
      "Protein, Kohlenhydrate und Fett zusammen können nicht mehr wiegen als die Bezugsmenge.",
    path: ["fat"],
  });
export type FoodInput = z.infer<typeof foodSchema>;

export const ingredientSchema = z.object({
  foodItemId: z.uuid("Bitte wähle ein Lebensmittel."),
  amount: requiredNumber("Menge", { min: 0.01, max: 100000 }),
  unit: z.enum(enums.food_unit, { error: "Bitte wähle eine Einheit." }),
  note: optionalText(200),
});

export const recipeSchema = z.object({
  name: z.string().trim().min(1, "Name ist erforderlich.").max(120, "Maximal 120 Zeichen."),
  description: optionalText(2000),
  category: z.enum(enums.recipe_category, { error: "Bitte wähle eine Kategorie." }),
  tags: z.array(z.enum(RECIPE_TAGS)).max(RECIPE_TAGS.length),
  servings: requiredNumber("Portionen", { min: 1, max: 100, int: true }),
  prepTime: requiredNumber("Zubereitungszeit", { min: 0, max: 1440, int: true }),
  cookTime: requiredNumber("Kochzeit", { min: 0, max: 1440, int: true }),
  fridgeLifeDays: optionalNumber("Haltbarkeit Kühlschrank", { min: 0, max: 60, int: true }),
  freezerLifeDays: optionalNumber("Haltbarkeit Tiefkühler", { min: 0, max: 730, int: true }),
  storageNotes: optionalText(1000),
  instructions: z
    .array(z.string().trim().max(1000, "Maximal 1000 Zeichen pro Schritt."))
    .max(50, "Maximal 50 Schritte.")
    .transform((steps) => steps.filter((s) => s.length > 0)),
  ingredients: z
    .array(ingredientSchema)
    .min(1, "Füge mindestens eine Zutat hinzu.")
    .max(60, "Maximal 60 Zutaten."),
});
export type RecipeInput = z.infer<typeof recipeSchema>;

export const recipeFilterSchema = z.object({
  q: optionalText(100),
  category: optionalEnum(enums.recipe_category),
  scope: z.enum(["all", "mine"]).catch("all"),
});
export type RecipeFilter = z.infer<typeof recipeFilterSchema>;
