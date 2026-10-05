import { describe, expect, it } from "vitest";
import {
  aggregatePrepRecipes,
  buildPrepTasks,
  estimatePrepMinutes,
  prepWindow,
  suggestedDuration,
  taskProgress,
  upcomingPrepWindows,
  windowLength,
  type RecipeSteps,
} from "./session";

// 2026-10-04 is a Sunday, 2026-10-07 a Wednesday.
describe("prepWindow", () => {
  it("covers the days until the next prep day", () => {
    expect(prepWindow("2026-10-04", [7, 3])).toEqual({
      date: "2026-10-04",
      coversTo: "2026-10-06",
    });
    expect(prepWindow("2026-10-07", [7, 3])).toEqual({
      date: "2026-10-07",
      coversTo: "2026-10-10",
    });
  });

  it("covers a whole week with a single prep day", () => {
    const window = prepWindow("2026-10-04", [7]);
    expect(window.coversTo).toBe("2026-10-10");
    expect(windowLength(window)).toBe(7);
  });
});

describe("upcomingPrepWindows", () => {
  it("lists prep days of the next seven days including today", () => {
    expect(upcomingPrepWindows("2026-10-05", [7, 3]).map((w) => w.date)).toEqual([
      "2026-10-07",
      "2026-10-11",
    ]);
    expect(upcomingPrepWindows("2026-10-07", [3]).map((w) => w.date)).toEqual(["2026-10-07"]);
  });
});

describe("aggregatePrepRecipes", () => {
  it("sums servings per recipe inside the window only", () => {
    const meals = [
      { date: "2026-10-05", recipeId: "a", recipeName: "Chicken Rice Bowl", servings: 1 },
      { date: "2026-10-06", recipeId: "a", recipeName: "Chicken Rice Bowl", servings: 1.5 },
      { date: "2026-10-06", recipeId: "b", recipeName: "Protein Oats", servings: 1 },
      { date: "2026-10-09", recipeId: "b", recipeName: "Protein Oats", servings: 1 },
    ];
    expect(aggregatePrepRecipes(meals, { date: "2026-10-04", coversTo: "2026-10-06" })).toEqual([
      { recipeId: "a", recipeName: "Chicken Rice Bowl", servings: 2.5 },
      { recipeId: "b", recipeName: "Protein Oats", servings: 1 },
    ]);
  });
});

const rice: RecipeSteps = {
  recipeId: "rice",
  recipeName: "Chicken Rice Bowl",
  servings: 4,
  prepTime: 15,
  cookTime: 25,
  instructions: ["Ofen auf 200 °C vorheizen.", "Reis kochen.", "Hähnchen würzen.", "Portionieren."],
};
const chili: RecipeSteps = {
  recipeId: "chili",
  recipeName: "Beef Chili",
  servings: 4,
  prepTime: 15,
  cookTime: 40,
  instructions: ["Zwiebeln schneiden.", "Hack anbraten.", "  ", "Köcheln lassen."],
};
const oats: RecipeSteps = {
  recipeId: "oats",
  recipeName: "Overnight Oats",
  servings: 2,
  prepTime: 10,
  cookTime: 0,
  instructions: ["Alles verrühren.", "Ofen vorheizen auf 180 °C"],
};

describe("buildPrepTasks", () => {
  const tasks = buildPrepTasks([rice, chili, oats]);
  const titles = tasks.map((t) => t.title);

  it("preheats the oven first and only once", () => {
    expect(titles[0]).toBe("Ofen auf 200 °C vorheizen.");
    expect(titles.filter((t) => /vorheiz/i.test(t))).toHaveLength(1);
  });

  it("starts the longest-cooking recipe first and interleaves the others", () => {
    expect(titles.slice(1, 4)).toEqual([
      "Beef Chili: Zwiebeln schneiden.",
      "Chicken Rice Bowl: Reis kochen.",
      "Overnight Oats: Alles verrühren.",
    ]);
  });

  it("keeps the step order within each recipe and skips empty steps", () => {
    const chiliSteps = titles.filter((t) => t.startsWith("Beef Chili"));
    expect(chiliSteps).toEqual([
      "Beef Chili: Zwiebeln schneiden.",
      "Beef Chili: Hack anbraten.",
      "Beef Chili: Köcheln lassen.",
    ]);
  });

  it("ends with portioning and storing", () => {
    expect(titles.at(-2)).toBe("Alle 10 Portionen in Boxen abfüllen");
    expect(tasks.at(-1)?.recipeId).toBeNull();
  });

  it("returns nothing for an empty session", () => {
    expect(buildPrepTasks([])).toEqual([]);
  });
});

describe("estimatePrepMinutes", () => {
  it("adds prep times, the longest cook time and 5 min per recipe", () => {
    expect(estimatePrepMinutes([rice, chili, oats])).toBe(15 + 15 + 10 + 40 + 15);
    expect(estimatePrepMinutes([])).toBe(0);
  });
});

describe("taskProgress", () => {
  it("returns the completed share in percent", () => {
    expect(
      taskProgress([
        { completed: true },
        { completed: true },
        { completed: true },
        { completed: false },
      ]),
    ).toBe(75);
    expect(taskProgress([])).toBe(0);
  });
});

describe("suggestedDuration", () => {
  const now = new Date("2026-10-04T14:00:00Z");

  it("uses the time since the session started", () => {
    expect(suggestedDuration("2026-10-04T12:30:00Z", 60, now)).toBe(90);
  });

  it("falls back to the estimate when not started or implausible", () => {
    expect(suggestedDuration(null, 60, now)).toBe(60);
    expect(suggestedDuration("2026-10-01T12:00:00Z", 60, now)).toBe(60);
    expect(suggestedDuration("2026-10-04T15:00:00Z", null, now)).toBeNull();
  });
});
