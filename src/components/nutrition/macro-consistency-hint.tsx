import { formatKcal } from "@/lib/nutrition/format";
import { calorieMacroMismatch, energyFromMacros, type Macros } from "@/lib/nutrition/macros";

/** Allowed difference between stated calories and 4/4/9-derived calories before warning. */
const MISMATCH_THRESHOLD = 0.05;

/** Shows the calories implied by the macros and warns if they contradict the calorie target. */
export function MacroConsistencyHint(macros: Macros) {
  const values = [macros.calories, macros.protein, macros.carbs, macros.fat];
  if (values.some((v) => !Number.isFinite(v) || v <= 0)) return null;

  const derived = energyFromMacros(macros);
  const mismatch = calorieMacroMismatch(macros) > MISMATCH_THRESHOLD;

  return (
    <p
      className={mismatch ? "text-sm text-status-under" : "text-sm text-muted-foreground"}
      aria-live="polite"
    >
      Deine Makros ergeben {formatKcal(derived)} kcal.
      {mismatch
        ? ` Das weicht deutlich von ${formatKcal(macros.calories)} kcal ab – prüfe deine Werte.`
        : " Passt zu deinem Kalorienziel."}
    </p>
  );
}
