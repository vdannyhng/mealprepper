import { describe, expect, it } from "vitest";
import {
  addDays,
  daysBetween,
  formatLongDate,
  formatShortDate,
  isIsoDate,
  isoWeek,
  isoWeekday,
  nextDateOnWeekdays,
  relativeDayLabel,
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

describe("German date formatting", () => {
  it("formats long and short dates without depending on ICU data", () => {
    expect(formatLongDate("2026-10-05")).toBe("Montag, 5. Oktober");
    expect(formatLongDate("2026-03-01")).toBe("Sonntag, 1. März");
    expect(formatShortDate("2026-10-11")).toBe("11. Okt.");
    expect(formatShortDate("2026-09-21")).toBe("21. Sept.");
  });

  it("labels nearby days relatively", () => {
    expect(relativeDayLabel("2026-10-05", "2026-10-05")).toBe("Heute");
    expect(relativeDayLabel("2026-10-05", "2026-10-06")).toBe("Morgen");
    expect(relativeDayLabel("2026-10-05", "2026-10-04")).toBe("Gestern");
    expect(relativeDayLabel("2026-10-05", "2026-10-08")).toBe("Donnerstag, 8. Oktober");
  });

  it("validates ISO dates", () => {
    expect(isIsoDate("2026-02-28")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("05.10.2026")).toBe(false);
  });
});
