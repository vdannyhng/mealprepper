"use client";

import { useState, useTransition } from "react";
import { NutritionSummary } from "@/components/nutrition/nutrition-summary";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckboxChipGroup } from "@/components/ui/choice-group";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import type { Food } from "@/features/foods/queries";
import { saveRecipe } from "@/features/recipes/actions";
import { recipeNutrition } from "@/lib/nutrition/recipe";
import type { FoodUnit } from "@/lib/nutrition/units";
import {
  RECIPE_CATEGORY_LABELS,
  RECIPE_TAGS,
  RECIPE_TAG_LABELS,
  type RecipeTag,
} from "@/lib/recipes/labels";
import { recipeSchema } from "@/lib/validation/recipes";
import { toFieldErrors, type FieldErrors } from "@/lib/validation/shared";
import type { Enums } from "@/types/database";
import { IngredientEditor, type IngredientRow } from "./ingredient-editor";
import { StepsEditor, newStepRow, type StepRow } from "./steps-editor";

export interface RecipeFormInitial {
  id?: string;
  name: string;
  description: string;
  category: Enums<"recipe_category">;
  tags: RecipeTag[];
  servings: number;
  prepTime: number;
  cookTime: number;
  fridgeLifeDays: number | null;
  freezerLifeDays: number | null;
  storageNotes: string;
  instructions: string[];
  ingredients: { food: Food; amount: number; unit: FoodUnit; note: string | null }[];
}

const EMPTY_RECIPE: RecipeFormInitial = {
  name: "",
  description: "",
  category: "lunch",
  tags: [],
  servings: 4,
  prepTime: 15,
  cookTime: 20,
  fridgeLifeDays: 4,
  freezerLifeDays: null,
  storageNotes: "",
  instructions: [],
  ingredients: [],
};

const str = (v: number | null) => (v == null ? "" : String(v));

export function RecipeForm({ initial = EMPTY_RECIPE }: { initial?: RecipeFormInitial }) {
  const [fields, setFields] = useState({
    name: initial.name,
    description: initial.description,
    category: initial.category,
    servings: String(initial.servings),
    prepTime: String(initial.prepTime),
    cookTime: String(initial.cookTime),
    fridgeLifeDays: str(initial.fridgeLifeDays),
    freezerLifeDays: str(initial.freezerLifeDays),
    storageNotes: initial.storageNotes,
  });
  const [tags, setTags] = useState<RecipeTag[]>(initial.tags);
  const [ingredients, setIngredients] = useState<IngredientRow[]>(() =>
    initial.ingredients.map((i) => ({
      key: crypto.randomUUID(),
      food: i.food,
      amount: String(i.amount),
      unit: i.unit,
      note: i.note ?? "",
    })),
  );
  const [steps, setSteps] = useState<StepRow[]>(() =>
    initial.instructions.length ? initial.instructions.map((t) => newStepRow(t)) : [newStepRow()],
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (key: keyof typeof fields) => ({
    value: fields[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value })),
    errors: errors[key],
  });

  const servings = Number(fields.servings) || 0;
  const preview = recipeNutrition(
    ingredients.map((i) => ({ amount: Number(i.amount) || 0, unit: i.unit, food: i.food })),
    servings,
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...fields,
      tags,
      instructions: steps.map((s) => s.text),
      ingredients: ingredients.map((i) => ({
        foodItemId: i.food.id,
        amount: i.amount,
        unit: i.unit,
        note: i.note,
      })),
    };
    const parsed = recipeSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      setFormError("Bitte überprüfe die markierten Felder.");
      return;
    }
    setErrors({});
    setFormError(null);
    startTransition(async () => {
      const result = await saveRecipe(parsed.data, initial.id);
      if (result.status === "error") {
        setFormError(result.message);
        setErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid content-start gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grunddaten</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Name"
              required
              maxLength={120}
              className="sm:col-span-2"
              {...set("name")}
            />
            <TextareaField
              label="Beschreibung (optional)"
              maxLength={2000}
              rows={2}
              className="sm:col-span-2"
              {...set("description")}
            />
            <SelectField label="Kategorie" {...set("category")}>
              {Object.entries(RECIPE_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>
            <InputField
              label="Portionen"
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              required
              {...set("servings")}
            />
            <InputField
              label="Zubereitungszeit"
              type="number"
              inputMode="numeric"
              min={0}
              suffix="min"
              {...set("prepTime")}
            />
            <InputField
              label="Kochzeit"
              type="number"
              inputMode="numeric"
              min={0}
              suffix="min"
              {...set("cookTime")}
            />
            <div className="sm:col-span-2">
              <CheckboxChipGroup
                legend="Tags"
                options={RECIPE_TAGS.map((t) => ({ value: t, label: RECIPE_TAG_LABELS[t] }))}
                values={tags}
                onChange={setTags}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zutaten</CardTitle>
          </CardHeader>
          <CardContent>
            <IngredientEditor rows={ingredients} onChange={setIngredients} errors={errors} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zubereitung</CardTitle>
          </CardHeader>
          <CardContent>
            <StepsEditor steps={steps} onChange={setSteps} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aufbewahrung</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Kühlschrank (optional)"
              type="number"
              inputMode="numeric"
              min={0}
              suffix="Tage"
              {...set("fridgeLifeDays")}
            />
            <InputField
              label="Tiefkühler (optional)"
              type="number"
              inputMode="numeric"
              min={0}
              suffix="Tage"
              {...set("freezerLifeDays")}
            />
            <TextareaField
              label="Aufbewahrungshinweise (optional)"
              rows={2}
              maxLength={1000}
              className="sm:col-span-2"
              {...set("storageNotes")}
            />
          </CardContent>
        </Card>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Nährwerte pro Portion</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <NutritionSummary nutrients={preview.perServing} className="grid-cols-2" />
            <p className="text-sm text-muted-foreground">
              Gesamt: {Math.round(preview.total.calories)} kcal ·{" "}
              {Math.round(preview.total.protein)} g Protein
            </p>
            {preview.unconvertible > 0 ? (
              <p className="text-sm text-status-under">
                {preview.unconvertible} Zutat(en) können in dieser Einheit nicht berechnet werden.
              </p>
            ) : null}
            {formError ? <Alert variant="error">{formError}</Alert> : null}
            <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
              {pending ? "Wird gespeichert…" : "Rezept speichern"}
            </Button>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
