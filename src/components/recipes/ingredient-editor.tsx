"use client";

import { X } from "lucide-react";
import { FoodPicker } from "@/components/foods/food-picker";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import type { Food } from "@/features/foods/queries";
import { ingredientNutrients } from "@/lib/nutrition/recipe";
import { availableUnits, defaultUnit, UNIT_LABELS, type FoodUnit } from "@/lib/nutrition/units";
import type { FieldErrors } from "@/lib/validation/shared";

export interface IngredientRow {
  key: string;
  food: Food;
  amount: string;
  unit: FoodUnit;
  note: string;
}

interface IngredientEditorProps {
  rows: IngredientRow[];
  onChange: (rows: IngredientRow[]) => void;
  errors: FieldErrors;
}

export function newIngredientRow(food: Food): IngredientRow {
  const unit = defaultUnit(food);
  return {
    key: crypto.randomUUID(),
    food,
    amount: unit === "piece" ? "1" : "100",
    unit,
    note: "",
  };
}

export function IngredientEditor({ rows, onChange, errors }: IngredientEditorProps) {
  const update = (key: string, patch: Partial<IngredientRow>) =>
    onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const listError = errors.ingredients?.[0];

  return (
    <div className="grid gap-3">
      {rows.length ? (
        <ul className="grid gap-2">
          {rows.map((row, index) => {
            const amountError = errors[`ingredients.${index}.amount`]?.[0];
            const kcal = ingredientNutrients({
              amount: Number(row.amount),
              unit: row.unit,
              food: row.food,
            })?.calories;
            return (
              <li key={row.key} className="grid gap-2 rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid">
                    <span className="text-sm font-medium">{row.food.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {Number.isFinite(kcal) ? `${Math.round(kcal ?? 0)} kcal` : "–"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`${row.food.name} entfernen`}
                    onClick={() => onChange(rows.filter((r) => r.key !== row.key))}
                  >
                    <X aria-hidden />
                  </Button>
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[8rem_7rem_1fr]">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    aria-label={`Menge ${row.food.name}`}
                    aria-invalid={amountError ? true : undefined}
                    value={row.amount}
                    onChange={(e) => update(row.key, { amount: e.target.value })}
                  />
                  <Select
                    aria-label={`Einheit ${row.food.name}`}
                    value={row.unit}
                    onChange={(e) => update(row.key, { unit: e.target.value as FoodUnit })}
                  >
                    {availableUnits(row.food).map((unit) => (
                      <option key={unit} value={unit}>
                        {UNIT_LABELS[unit]}
                      </option>
                    ))}
                  </Select>
                  <Input
                    aria-label={`Notiz ${row.food.name}`}
                    placeholder="Notiz (optional), z. B. gewürfelt"
                    maxLength={200}
                    className="col-span-2 sm:col-span-1"
                    value={row.note}
                    onChange={(e) => update(row.key, { note: e.target.value })}
                  />
                </div>
                {amountError ? (
                  <p className="text-xs font-medium text-destructive">{amountError}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      <FoodPicker
        label="Zutat hinzufügen"
        invalid={Boolean(listError)}
        describedBy={listError ? "ingredients-error" : undefined}
        onSelect={(food) => onChange([...rows, newIngredientRow(food)])}
      />
      {listError ? (
        <p id="ingredients-error" className="text-xs font-medium text-destructive">
          {listError}
        </p>
      ) : null}
    </div>
  );
}
