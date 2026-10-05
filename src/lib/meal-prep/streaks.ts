import { addDays, isoWeek, startOfIsoWeek, type IsoDate } from "@/lib/dates";

export interface StreakResult {
  current: number;
  longest: number;
}

/**
 * Meal-prep streak in ISO weeks. A week counts when at least one session in it was
 * completed. The running week only extends the streak – it does not break it while it
 * is still in progress.
 */
export function mealPrepStreak(completedDates: readonly IsoDate[], today: IsoDate): StreakResult {
  const weeks = new Set(completedDates.map(startOfIsoWeek));
  const thisWeek = startOfIsoWeek(today);

  let current = 0;
  let cursor = weeks.has(thisWeek) ? thisWeek : addDays(thisWeek, -7);
  while (weeks.has(cursor)) {
    current++;
    cursor = addDays(cursor, -7);
  }

  return { current, longest: Math.max(current, longestRun([...weeks], 7)) };
}

/**
 * Nutrition adherence streak in days: consecutive completed days within the targets.
 * Today does not break the streak while it has not been completed yet.
 */
export function nutritionStreak(
  logs: readonly { date: IsoDate; completed: boolean; targetMet: boolean | null }[],
  today: IsoDate,
): StreakResult {
  const good = new Set(logs.filter((l) => l.completed && l.targetMet).map((l) => l.date));
  let current = 0;
  let cursor = good.has(today) ? today : addDays(today, -1);
  while (good.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { current, longest: Math.max(current, longestRun([...good], 1)) };
}

/** Longest run of dates that are exactly `stepDays` apart. */
function longestRun(dates: IsoDate[], stepDays: number): number {
  const sorted = [...new Set(dates)].sort();
  let longest = 0;
  let run = 0;
  let previous: IsoDate | null = null;
  for (const date of sorted) {
    run = previous && addDays(previous, stepDays) === date ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }
  return longest;
}

export interface WeekStatus {
  weekStart: IsoDate;
  year: number;
  week: number;
  done: boolean;
}

/** The last `count` ISO weeks (oldest first) with whether a session was completed. */
export function weekHistory(
  completedDates: readonly IsoDate[],
  today: IsoDate,
  count = 8,
): WeekStatus[] {
  const weeks = new Set(completedDates.map(startOfIsoWeek));
  const thisWeek = startOfIsoWeek(today);
  return Array.from({ length: count }, (_, i) => {
    const weekStart = addDays(thisWeek, -7 * (count - 1 - i));
    return { weekStart, ...isoWeek(weekStart), done: weeks.has(weekStart) };
  });
}
