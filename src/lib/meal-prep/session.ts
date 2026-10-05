import { addDays, daysBetween, isoWeekday, type IsoDate } from "@/lib/dates";
import { roundTo } from "@/lib/nutrition/macros";

/** A prep day and the date range of meals it prepares (inclusive). */
export interface PrepWindow {
  date: IsoDate;
  coversTo: IsoDate;
}

const MAX_WINDOW_DAYS = 7;

/**
 * The meals a prep session covers: from the prep day itself up to the day before the next
 * prep day (max. 7 days). Example with prep on Sunday and Wednesday:
 * Sunday covers Sun–Tue, Wednesday covers Wed–Sat.
 */
export function prepWindow(date: IsoDate, prepWeekdays: readonly number[]): PrepWindow {
  for (let offset = 1; offset <= MAX_WINDOW_DAYS; offset++) {
    if (prepWeekdays.includes(isoWeekday(addDays(date, offset)))) {
      return { date, coversTo: addDays(date, offset - 1) };
    }
  }
  return { date, coversTo: addDays(date, MAX_WINDOW_DAYS - 1) };
}

/** Prep days from `from` (inclusive) within the next `days` days, each with its window. */
export function upcomingPrepWindows(
  from: IsoDate,
  prepWeekdays: readonly number[],
  days = 7,
): PrepWindow[] {
  const windows: PrepWindow[] = [];
  for (let offset = 0; offset < days; offset++) {
    const date = addDays(from, offset);
    if (prepWeekdays.includes(isoWeekday(date))) windows.push(prepWindow(date, prepWeekdays));
  }
  return windows;
}

export function windowLength(window: PrepWindow): number {
  return daysBetween(window.date, window.coversTo) + 1;
}

export interface MealForPrep {
  date: IsoDate;
  recipeId: string;
  recipeName: string;
  servings: number;
}

export interface PrepRecipe {
  recipeId: string;
  recipeName: string;
  servings: number;
}

/** Sums the planned servings per recipe for the meals inside the window. */
export function aggregatePrepRecipes(
  meals: readonly MealForPrep[],
  window: PrepWindow,
): PrepRecipe[] {
  const byRecipe = new Map<string, PrepRecipe>();
  for (const meal of meals) {
    if (meal.date < window.date || meal.date > window.coversTo) continue;
    const entry = byRecipe.get(meal.recipeId);
    if (entry) entry.servings = roundTo(entry.servings + meal.servings);
    else byRecipe.set(meal.recipeId, { ...meal, servings: meal.servings });
  }
  return [...byRecipe.values()]
    .map(({ recipeId, recipeName, servings }) => ({ recipeId, recipeName, servings }))
    .sort((a, b) => b.servings - a.servings || a.recipeName.localeCompare(b.recipeName));
}

export interface RecipeSteps {
  recipeId: string;
  recipeName: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  instructions: string[];
}

export interface PrepTask {
  title: string;
  recipeId: string | null;
}

const PREHEAT = /ofen.*vorheiz|vorheiz.*ofen/i;

/**
 * Rule-based combined cooking flow:
 * 1. Preheating the oven comes first (only once).
 * 2. Recipes with the longest cooking time start first; their steps are interleaved
 *    round-robin so long-running steps run in parallel. Step order within a recipe is kept.
 * 3. Portioning, labelling and storing close the session.
 */
export function buildPrepTasks(recipes: readonly RecipeSteps[]): PrepTask[] {
  const tasks: PrepTask[] = [];
  const preheat = recipes.flatMap((r) => r.instructions).find((s) => PREHEAT.test(s));
  if (preheat) tasks.push({ title: preheat, recipeId: null });

  const queues = [...recipes]
    .sort((a, b) => b.cookTime - a.cookTime || a.recipeName.localeCompare(b.recipeName))
    .map((r) => ({
      recipe: r,
      steps: r.instructions.map((s) => s.trim()).filter((s) => s && !PREHEAT.test(s)),
    }));

  const longest = Math.max(0, ...queues.map((q) => q.steps.length));
  for (let i = 0; i < longest; i++) {
    for (const { recipe, steps } of queues) {
      const step = steps[i];
      if (step) tasks.push({ title: `${recipe.recipeName}: ${step}`, recipeId: recipe.recipeId });
    }
  }

  const portions = Math.round(recipes.reduce((sum, r) => sum + r.servings, 0));
  if (recipes.length) {
    tasks.push({ title: `Alle ${portions} Portionen in Boxen abfüllen`, recipeId: null });
    tasks.push({
      title: "Boxen beschriften und in Kühlschrank / Tiefkühler stellen",
      recipeId: null,
    });
  }
  return tasks;
}

/** Rough duration: all hands-on prep time + the longest cooking time + 5 min per recipe. */
export function estimatePrepMinutes(
  recipes: readonly Pick<RecipeSteps, "prepTime" | "cookTime">[],
) {
  if (!recipes.length) return 0;
  const prep = recipes.reduce((sum, r) => sum + r.prepTime, 0);
  const cook = Math.max(...recipes.map((r) => r.cookTime));
  return prep + cook + 5 * recipes.length;
}

/** Share of completed tasks in percent (0–100). */
export function taskProgress(tasks: readonly { completed: boolean }[]): number {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
}

const MAX_PLAUSIBLE_SESSION_MINUTES = 720;

/**
 * Pre-filled duration for "Meal Prep abgeschlossen": minutes since the session was
 * started if plausible, otherwise the estimate.
 */
export function suggestedDuration(
  startedAt: string | null,
  estimatedMinutes: number | null,
  now: Date = new Date(),
): number | null {
  if (startedAt) {
    const minutes = Math.round((now.getTime() - new Date(startedAt).getTime()) / 60_000);
    if (minutes > 0 && minutes <= MAX_PLAUSIBLE_SESSION_MINUTES) return minutes;
  }
  return estimatedMinutes;
}
