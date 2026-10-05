import { describe, expect, it } from "vitest";
import {
  INITIAL_WIZARD_STATE,
  firstInvalidStep,
  parseFoodList,
  stepErrors,
  validateWizard,
  type WizardState,
} from "./wizard";

const complete: WizardState = {
  ...INITIAL_WIZARD_STATE,
  goal: "fat_loss",
  targets: { calories: "2400", protein: "180", carbs: "260", fat: "70", fiber: "" },
  prepWeekdays: [7, 3],
  allergens: ["gluten"],
  dislikedFoods: "Pilze, Fisch,\nSellerie, pilze",
};

describe("parseFoodList", () => {
  it("splits, trims and de-duplicates case-insensitively", () => {
    expect(parseFoodList(" Pilze, Fisch;\nSellerie, pilze ,, ")).toEqual([
      "Pilze",
      "Fisch",
      "Sellerie",
    ]);
  });
});

describe("validateWizard", () => {
  it("accepts a complete wizard and coerces numbers", () => {
    const result = validateWizard(complete);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.targets).toEqual({
      calories: 2400,
      protein: 180,
      carbs: 260,
      fat: 70,
      fiber: undefined,
    });
    expect(result.data.dislikedFoods).toEqual(["Pilze", "Fisch", "Sellerie"]);
    expect(result.data.body).toEqual({
      sex: undefined,
      age: undefined,
      weightKg: undefined,
      heightCm: undefined,
      activityLevel: undefined,
    });
  });

  it("reports missing goal and macros on the right steps", () => {
    const result = validateWizard(INITIAL_WIZARD_STATE);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(firstInvalidStep(result.errors)).toBe(0);
    expect(Object.keys(stepErrors(result.errors, 1))).toEqual(
      expect.arrayContaining([
        "targets.calories",
        "targets.protein",
        "targets.carbs",
        "targets.fat",
      ]),
    );
    expect(result.errors["targets.calories"]).toEqual(["Kalorien ist erforderlich."]);
    expect(stepErrors(result.errors, 2)).toEqual({});
  });

  it("rejects implausible calories and an empty prep schedule", () => {
    const result = validateWizard({
      ...complete,
      targets: { ...complete.targets, calories: "200" },
      prepWeekdays: [],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors["targets.calories"]?.[0]).toMatch(/mindestens 800/);
    expect(result.errors.prepWeekdays?.[0]).toBe("Wähle mindestens einen Meal-Prep-Tag.");
  });
});
