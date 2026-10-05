import { describe, expect, it } from "vitest";
import {
  addDays,
  daysBetween,
  isoWeek,
  isoWeekday,
  nextDateOnWeekdays,
  startOfIsoWeek,
  todayIsoDate,
} from "./dates";

describe("ISO week helpers", () => {
  it("computes ISO weekdays", () => {
    expect(isoWeekday("2026-10-05")).toBe(1); // Monday
    expect(isoWeekday("2026-10-11")).toBe(7); // Sunday
  });

  it("finds the Monday of a week", () => {
    expect(startOfIsoWeek("2026-10-11")).toBe("2026-10-05");
    expect(startOfIsoWeek("2026-10-05")).toBe("2026-10-05");
  });

  it("handles year boundaries", () => {
    expect(isoWeek("2026-01-01")).toEqual({ year: 2026, week: 1 });
    expect(isoWeek("2027-01-01")).toEqual({ year: 2026, week: 53 });
    expect(isoWeek("2024-12-30")).toEqual({ year: 2025, week: 1 });
    expect(isoWeek("2026-10-05")).toEqual({ year: 2026, week: 41 });
  });

  it("adds days across month and DST boundaries", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30");
    expect(daysBetween("2026-10-05", "2026-10-11")).toBe(6);
  });
});

describe("nextDateOnWeekdays", () => {
  it("includes today", () => {
    expect(nextDateOnWeekdays("2026-10-11", [7])).toBe("2026-10-11");
  });

  it("finds the next matching weekday", () => {
    expect(nextDateOnWeekdays("2026-10-05", [3, 7])).toBe("2026-10-07");
  });

  it("returns null without weekdays", () => {
    expect(nextDateOnWeekdays("2026-10-05", [])).toBeNull();
  });
});

describe("todayIsoDate", () => {
  it("evaluates the date in the given timezone", () => {
    const lateEveningUtc = new Date("2026-10-05T22:30:00Z");
    expect(todayIsoDate("Europe/Zurich", lateEveningUtc)).toBe("2026-10-06");
    expect(todayIsoDate("UTC", lateEveningUtc)).toBe("2026-10-05");
  });
});
