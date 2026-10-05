import { formatGrams, formatKcal } from "@/lib/nutrition/format";
import type { WeekSummary } from "@/lib/planning/week";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="grid gap-0.5 rounded-lg bg-muted p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
      {hint ? <dd className="text-xs text-muted-foreground">{hint}</dd> : null}
    </div>
  );
}

/** Week overview: averages per planned day and how many days hit the targets. */
export function WeekSummaryStats({
  summary,
  hasTarget,
}: {
  summary: WeekSummary;
  hasTarget: boolean;
}) {
  const avg = summary.average;
  const perDay = `über ${summary.plannedDays} geplante${summary.plannedDays === 1 ? "n Tag" : " Tage"}`;
  return (
    <dl className="grid grid-cols-2 gap-2 md:grid-cols-4" aria-label="Wochenübersicht">
      <Stat
        label="Ø Kalorien / Tag"
        value={avg ? `${formatKcal(avg.calories)} kcal` : "–"}
        hint={avg ? perDay : undefined}
      />
      <Stat
        label="Ø Protein / Tag"
        value={avg ? `${formatGrams(avg.protein)} g` : "–"}
        hint={avg ? perDay : undefined}
      />
      <Stat
        label="Im Kalorienziel"
        value={hasTarget ? `${summary.daysWithinCalories} / 7 Tage` : "–"}
      />
      <Stat
        label="Proteinziel erreicht"
        value={hasTarget ? `${summary.daysProteinMet} / 7 Tage` : "–"}
      />
    </dl>
  );
}
