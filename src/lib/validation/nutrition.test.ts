import { describe, expect, it } from "vitest";
import { toFieldErrors } from "./shared";
import { macroTargetSchema, planningPreferencesSchema, toleranceSchema } from "./nutrition";

describe("macroTargetSchema", () => {
  it("accepts the spec example and treats an empty fiber field as missing", () => {
    expect(
      macroTargetSchema.parse({
        calories: "2400",
        protein: "180",
        carbs: "260",
        fat: "70",
        fiber: "",
      }),
    ).toEqual({ calories: 2400, protein: 180, carbs: 260, fat: 70, fiber: undefined });
  });

  it("requires plausible whole-number calories", () => {
    const tooLow = macroTargetSchema.safeParse({
      calories: "500",
      protein: "1",
      carbs: "1",
      fat: "1",
    });
    expect(tooLow.success).toBe(false);
    const fraction = macroTargetSchema.safeParse({
      calories: "2400.5",
      protein: "1",
      carbs: "1",
      fat: "1",
    });
    expect(fraction.success).toBe(false);
  });

  it("rejects negative macros with a readable message", () => {
    const result = macroTargetSchema.safeParse({
      calories: "2400",
      protein: "-5",
      carbs: "1",
      fat: "1",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(toFieldErrors(result.error).protein?.[0]).toBe("Protein muss mindestens 0 sein.");
  });
});

describe("toleranceSchema", () => {
  it("accepts the defaults and limits the protein minimum to 50–100 %", () => {
    expect(
      toleranceSchema.safeParse({
        caloriesPct: "5",
        proteinMinPct: "95",
        carbsPct: "10",
        fatPct: "10",
      }).success,
    ).toBe(true);
    expect(
      toleranceSchema.safeParse({
        caloriesPct: "5",
        proteinMinPct: "40",
        carbsPct: "10",
        fatPct: "10",
      }).success,
    ).toBe(false);
  });
});

describe("planningPreferencesSchema", () => {
  it("parses repeated form values", () => {
    expect(
      planningPreferencesSchema.parse({
        prepWeekdays: ["7", "3"],
        mealsPerDay: "3",
        snacksPerDay: "1",
      }),
    ).toEqual({ prepWeekdays: [7, 3], mealsPerDay: 3, snacksPerDay: 1 });
  });

  it("requires at least one valid prep day", () => {
    expect(
      planningPreferencesSchema.safeParse({ prepWeekdays: [], mealsPerDay: "3", snacksPerDay: "1" })
        .success,
    ).toBe(false);
    expect(
      planningPreferencesSchema.safeParse({
        prepWeekdays: ["8"],
        mealsPerDay: "3",
        snacksPerDay: "1",
      }).success,
    ).toBe(false);
  });
});
