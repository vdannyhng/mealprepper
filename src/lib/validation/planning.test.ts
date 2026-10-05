import { describe, expect, it } from "vitest";
import { addPlannedMealSchema, copyDaySchema, plannedMealServingsSchema } from "./planning";

const RECIPE = "4f1c2b8e-1d2a-4c3b-9e8f-0a1b2c3d4e5f";

describe("addPlannedMealSchema", () => {
  const valid = { weekStart: "2026-10-05", date: "2026-10-07", slot: "lunch", recipeId: RECIPE };

  it("accepts a date inside the week and defaults to one serving", () => {
    expect(addPlannedMealSchema.parse(valid).servings).toBe(1);
  });

  it("rejects weeks that do not start on Monday", () => {
    expect(addPlannedMealSchema.safeParse({ ...valid, weekStart: "2026-10-06" }).success).toBe(
      false,
    );
  });

  it("rejects dates outside the week and invalid dates", () => {
    expect(addPlannedMealSchema.safeParse({ ...valid, date: "2026-10-12" }).success).toBe(false);
    expect(addPlannedMealSchema.safeParse({ ...valid, date: "2026-02-30" }).success).toBe(false);
  });

  it("rejects unknown slots and non-uuid recipes", () => {
    expect(addPlannedMealSchema.safeParse({ ...valid, slot: "brunch" }).success).toBe(false);
    expect(addPlannedMealSchema.safeParse({ ...valid, recipeId: "1; drop" }).success).toBe(false);
  });
});

describe("plannedMealServingsSchema", () => {
  it("limits servings to 0.25–20", () => {
    expect(plannedMealServingsSchema.safeParse({ id: RECIPE, servings: 0 }).success).toBe(false);
    expect(plannedMealServingsSchema.safeParse({ id: RECIPE, servings: 21 }).success).toBe(false);
    expect(plannedMealServingsSchema.safeParse({ id: RECIPE, servings: 1.5 }).success).toBe(true);
  });
});

describe("copyDaySchema", () => {
  const valid = { weekStart: "2026-10-05", from: "2026-10-05", to: ["2026-10-06"], replace: true };

  it("requires at least one target day in the same week", () => {
    expect(copyDaySchema.safeParse(valid).success).toBe(true);
    expect(copyDaySchema.safeParse({ ...valid, to: [] }).success).toBe(false);
    expect(copyDaySchema.safeParse({ ...valid, to: ["2026-10-13"] }).success).toBe(false);
  });
});
