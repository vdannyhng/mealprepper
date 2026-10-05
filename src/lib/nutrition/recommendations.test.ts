import { describe, expect, it } from "vitest";
import { energyFromMacros } from "./macros";
import { basalMetabolicRate, recommendMacroTargets, type BodyData } from "./recommendations";

const body: BodyData = {
  sex: "male",
  age: 30,
  weightKg: 80,
  heightCm: 180,
  activityLevel: "moderate",
};

describe("basalMetabolicRate", () => {
  it("implements Mifflin-St Jeor", () => {
    expect(basalMetabolicRate(body)).toBe(1780);
    expect(basalMetabolicRate({ ...body, sex: "female" })).toBe(1614);
  });
});

describe("recommendMacroTargets", () => {
  it("creates a deficit for fat loss and a surplus for muscle gain", () => {
    const maintenance = recommendMacroTargets(body, "maintenance");
    expect(recommendMacroTargets(body, "fat_loss").calories).toBeLessThan(maintenance.calories);
    expect(recommendMacroTargets(body, "muscle_gain").calories).toBeGreaterThan(
      maintenance.calories,
    );
  });

  it("keeps macros consistent with calories", () => {
    for (const goal of ["fat_loss", "maintenance", "muscle_gain"] as const) {
      const t = recommendMacroTargets(body, goal);
      expect(Math.abs(energyFromMacros(t) - t.calories)).toBeLessThanOrEqual(4);
    }
  });

  it("sets protein per kg body weight", () => {
    expect(recommendMacroTargets(body, "fat_loss").protein).toBe(176);
  });
});
