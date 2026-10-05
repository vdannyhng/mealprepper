"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { NutritionSummary } from "@/components/nutrition/nutrition-summary";
import { Button } from "@/components/ui/button";
import { recipeNutrition, scaleIngredients, type FoodNutrition } from "@/lib/nutrition/recipe";
import { formatQuantity, type FoodUnit } from "@/lib/nutrition/units";

export interface ScalerIngredient {
  id: string;
  name: string;
  amount: number;
  unit: FoodUnit;
  note: string | null;
  food: FoodNutrition;
}

const MAX_SERVINGS = 100;

/** Ingredient list with a servings stepper; amounts and totals scale live. */
export function RecipeScaler({
  servings: baseServings,
  ingredients,
}: {
  servings: number;
  ingredients: ScalerIngredient[];
}) {
  const [servings, setServings] = useState(baseServings);
  const scaled = scaleIngredients(ingredients, baseServings, servings);
  const { total, perServing, unconvertible } = recipeNutrition(scaled, servings);

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <span id="servings-label" className="text-sm font-medium">
          Portionen
        </span>
        <div className="flex items-center gap-2" role="group" aria-labelledby="servings-label">
          <Button
            variant="outline"
            size="icon"
            aria-label="Eine Portion weniger"
            disabled={servings <= 1}
            onClick={() => setServings((s) => Math.max(1, s - 1))}
          >
            <Minus aria-hidden />
          </Button>
          <output
            aria-live="polite"
            className="w-10 text-center text-lg font-semibold tabular-nums"
          >
            {servings}
          </output>
          <Button
            variant="outline"
            size="icon"
            aria-label="Eine Portion mehr"
            disabled={servings >= MAX_SERVINGS}
            onClick={() => setServings((s) => Math.min(MAX_SERVINGS, s + 1))}
          >
            <Plus aria-hidden />
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Pro Portion</h3>
        <NutritionSummary nutrients={perServing} />
      </div>
      <p className="text-sm text-muted-foreground">
        Gesamt ({servings} Portionen): {Math.round(total.calories)} kcal ·{" "}
        {Math.round(total.protein)} g Protein
      </p>
      {unconvertible > 0 ? (
        <p className="text-sm text-status-under">
          {unconvertible} Zutat(en) konnten nicht umgerechnet werden und fehlen in den Nährwerten.
        </p>
      ) : null}

      <div className="grid gap-2">
        <h3 className="font-semibold">Zutaten</h3>
        <ul className="divide-y rounded-lg border">
          {scaled.map((i) => (
            <li
              key={i.id}
              className="flex items-baseline justify-between gap-3 px-3 py-2.5 text-sm"
            >
              <span>
                {i.name}
                {i.note ? <span className="text-muted-foreground"> · {i.note}</span> : null}
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {formatQuantity(i.amount, i.unit)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
