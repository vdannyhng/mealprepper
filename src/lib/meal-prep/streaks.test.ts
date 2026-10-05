import { describe, expect, it } from "vitest";
import { mealPrepStreak, nutritionStreak, weekHistory } from "./streaks";

const today = "2026-10-07"; // Wednesday, KW 41

describe("mealPrepStreak", () => {
  it("counts consecutive ISO weeks including the current one", () => {
    // KW 41, 40, 39 completed
    const dates = ["2026-10-05", "2026-10-04", "2026-09-21"];
    expect(mealPrepStreak(dates, today)).toEqual({ current: 3, longest: 3 });
  });

  it("does not break while the current week is still open", () => {
    // KW 40, 39 completed, nothing yet in KW 41
    expect(mealPrepStreak(["2026-10-04", "2026-09-22"], today).current).toBe(2);
  });

  it("breaks after a missed week but remembers the longest streak", () => {
    // KW 41, then gap in KW 40, then KW 39–37
    const dates = ["2026-10-06", "2026-09-23", "2026-09-16", "2026-09-09"];
    expect(mealPrepStreak(dates, today)).toEqual({ current: 1, longest: 3 });
  });

  it("counts several sessions in one week only once", () => {
    expect(mealPrepStreak(["2026-10-05", "2026-10-07"], today)).toEqual({ current: 1, longest: 1 });
  });

  it("handles the ISO year boundary", () => {
    // 2026-12-28 is KW 53 of 2026, 2027-01-04 is KW 1 of 2027
    expect(mealPrepStreak(["2026-12-28", "2027-01-04"], "2027-01-05").current).toBe(2);
  });

  it("returns zero without sessions", () => {
    expect(mealPrepStreak([], today)).toEqual({ current: 0, longest: 0 });
  });
});

describe("nutritionStreak", () => {
  const log = (date: string, targetMet = true) => ({ date, completed: true, targetMet });

  it("counts consecutive days within targets", () => {
    const logs = [log("2026-10-07"), log("2026-10-06"), log("2026-10-05"), log("2026-10-03")];
    expect(nutritionStreak(logs, today)).toEqual({ current: 3, longest: 3 });
  });

  it("does not break because today is not finished yet", () => {
    expect(nutritionStreak([log("2026-10-06"), log("2026-10-05")], today).current).toBe(2);
  });

  it("is broken by a missed target", () => {
    expect(nutritionStreak([log("2026-10-06"), log("2026-10-05", false)], today).current).toBe(1);
  });

  it("ignores days that were not completed", () => {
    const logs = [{ date: "2026-10-06", completed: false, targetMet: true }];
    expect(nutritionStreak(logs, today).current).toBe(0);
  });
});

describe("weekHistory", () => {
  it("lists the last weeks oldest first with their status", () => {
    const history = weekHistory(["2026-10-05", "2026-09-23"], today, 3);
    expect(history.map((w) => [w.week, w.done])).toEqual([
      [39, true],
      [40, false],
      [41, true],
    ]);
  });
});
