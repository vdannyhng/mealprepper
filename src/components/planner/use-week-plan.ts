"use client";

import { useState } from "react";
import {
  addPlannedMeal,
  clearPlannedDay,
  copyPlannedDay,
  loadWeekMeals,
  movePlannedMeal,
  removePlannedMeal,
  setPlannedMealServings,
  type PlanResult,
} from "@/features/planning/actions";
import type { PlannedMeal } from "@/features/planning/queries";
import type { IsoDate } from "@/lib/dates";
import type { MealSlot } from "@/lib/planning/week";
import { isTempId } from "./meal-chip";
import type { RecipeOption } from "./types";

const OFFLINE_MESSAGE =
  "Keine Verbindung zum Server. Deine letzte Änderung wurde nicht gespeichert.";

/**
 * Planner state with optimistic updates: every change is shown immediately, saved in the
 * background (autosave) and rolled back with a message if the server rejects it.
 */
export function useWeekPlan(
  weekStart: IsoDate,
  initialMeals: PlannedMeal[],
  recipes: RecipeOption[],
) {
  const [meals, setMeals] = useState(initialMeals);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function track<T>(op: () => Promise<PlanResult<T>>, rollback: () => void) {
    setPending((p) => p + 1);
    setError(null);
    try {
      const result = await op();
      if (!result.ok) {
        rollback();
        setError(result.message);
      }
      return result;
    } catch {
      rollback();
      setError(OFFLINE_MESSAGE);
      return { ok: false, message: OFFLINE_MESSAGE } as const;
    } finally {
      setPending((p) => p - 1);
    }
  }

  const restore = (meal: PlannedMeal) => () =>
    setMeals((ms) =>
      ms.some((m) => m.id === meal.id)
        ? ms.map((m) => (m.id === meal.id ? meal : m))
        : [...ms, meal],
    );

  async function add(date: IsoDate, slot: MealSlot, recipeId: string) {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;
    const tempId = `tmp-${crypto.randomUUID()}`;
    setMeals((ms) => [
      ...ms,
      {
        id: tempId,
        date,
        slot,
        servings: 1,
        status: "planned",
        recipeId,
        recipeName: recipe.name,
        perServing: recipe.perServing,
      },
    ]);
    const result = await track(
      () => addPlannedMeal({ weekStart, date, slot, recipeId, servings: 1 }),
      () => setMeals((ms) => ms.filter((m) => m.id !== tempId)),
    );
    if (result.ok) {
      setMeals((ms) => ms.map((m) => (m.id === tempId ? { ...m, id: result.data.id } : m)));
    }
  }

  function move(mealId: string, date: IsoDate, slot: MealSlot) {
    const meal = meals.find((m) => m.id === mealId);
    if (!meal || isTempId(mealId) || (meal.date === date && meal.slot === slot)) return;
    setMeals((ms) => ms.map((m) => (m.id === mealId ? { ...m, date, slot } : m)));
    void track(() => movePlannedMeal({ id: mealId, date, slot }), restore(meal));
  }

  function setServings(mealId: string, servings: number) {
    const meal = meals.find((m) => m.id === mealId);
    if (!meal || isTempId(mealId)) return;
    setMeals((ms) => ms.map((m) => (m.id === mealId ? { ...m, servings } : m)));
    void track(() => setPlannedMealServings({ id: mealId, servings }), restore(meal));
  }

  function remove(mealId: string) {
    const meal = meals.find((m) => m.id === mealId);
    if (!meal || isTempId(mealId)) return;
    setMeals((ms) => ms.filter((m) => m.id !== mealId));
    void track(() => removePlannedMeal(mealId), restore(meal));
  }

  function clearDay(date: IsoDate) {
    const removed = meals.filter((m) => m.date === date && !isTempId(m.id));
    setMeals((ms) => ms.filter((m) => !removed.includes(m)));
    void track(
      () => clearPlannedDay(date),
      () => setMeals((ms) => [...ms, ...removed]),
    );
  }

  async function copyDay(from: IsoDate, to: IsoDate[], replace: boolean) {
    const result = await track(
      () => copyPlannedDay({ weekStart, from, to, replace }),
      () => undefined,
    );
    if (!result.ok) return false;
    const reloaded = await track(
      () => loadWeekMeals(weekStart),
      () => undefined,
    );
    if (reloaded.ok) setMeals(reloaded.data);
    return true;
  }

  return {
    meals,
    saving: pending > 0,
    error,
    dismissError: () => setError(null),
    add,
    move,
    setServings,
    remove,
    clearDay,
    copyDay,
  };
}
