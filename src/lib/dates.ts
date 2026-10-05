/**
 * Date helpers working on calendar dates ("YYYY-MM-DD") to avoid timezone drift.
 * All week logic follows ISO 8601: weeks start on Monday, weekday 1 = Monday … 7 = Sunday.
 */

/** Until users can choose their own timezone, "today" is evaluated in this zone. */
export const APP_TIME_ZONE = "Europe/Zurich";

export type IsoDate = string;

/** Today's calendar date in the given timezone. */
export function todayIsoDate(timeZone = APP_TIME_ZONE, now: Date = new Date()): IsoDate {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function toUtcDate(date: IsoDate): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}

function fromUtcDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const d = toUtcDate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return fromUtcDate(d);
}

/** ISO weekday: 1 = Monday … 7 = Sunday */
export function isoWeekday(date: IsoDate): number {
  const day = toUtcDate(date).getUTCDay();
  return day === 0 ? 7 : day;
}

export function startOfIsoWeek(date: IsoDate): IsoDate {
  return addDays(date, 1 - isoWeekday(date));
}

/** ISO week number and week-based year (e.g. 2026-W01 may start in December 2025). */
export function isoWeek(date: IsoDate): { year: number; week: number } {
  const d = toUtcDate(date);
  // Thursday of the current week decides the year.
  d.setUTCDate(d.getUTCDate() + 4 - isoWeekday(date));
  const year = d.getUTCFullYear();
  const firstDay = Date.UTC(year, 0, 1);
  const week = Math.ceil(((d.getTime() - firstDay) / 86_400_000 + 1) / 7);
  return { year, week };
}

/** Next date (today included) that falls on one of the given ISO weekdays. */
export function nextDateOnWeekdays(from: IsoDate, weekdays: readonly number[]): IsoDate | null {
  if (weekdays.length === 0) return null;
  for (let offset = 0; offset < 7; offset++) {
    const candidate = addDays(from, offset);
    if (weekdays.includes(isoWeekday(candidate))) return candidate;
  }
  return null;
}

export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtcDate(to).getTime() - toUtcDate(from).getTime()) / 86_400_000);
}

const longDate = new Intl.DateTimeFormat("de-CH", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export function formatLongDate(date: IsoDate): string {
  return longDate.format(toUtcDate(date));
}
