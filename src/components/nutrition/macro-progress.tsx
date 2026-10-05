import { formatGrams, formatKcal } from "@/lib/nutrition/format";
import { MACRO_LABELS } from "@/lib/nutrition/labels";
import type { MacroKey } from "@/lib/nutrition/macros";
import {
  DEFAULT_TOLERANCES,
  macroStatus,
  progressPercent,
  type MacroStatus,
  type MacroTolerances,
} from "@/lib/nutrition/tolerance";
import { cn } from "@/lib/utils";

const BAR_COLOR: Record<MacroKey, string> = {
  calories: "bg-macro-calories",
  protein: "bg-macro-protein",
  carbs: "bg-macro-carbs",
  fat: "bg-macro-fat",
};

const STATUS: Record<MacroStatus, { label: string; className: string }> = {
  under: { label: "unter Ziel", className: "text-status-under" },
  met: { label: "im Ziel", className: "text-status-met" },
  over: { label: "über Ziel", className: "text-status-over" },
};

interface MacroProgressProps {
  macro: MacroKey;
  actual: number;
  target: number;
  tolerances?: MacroTolerances;
  /** Hide the status label, e.g. while the day has not been planned yet. */
  showStatus?: boolean;
}

export function MacroProgress({
  macro,
  actual,
  target,
  tolerances = DEFAULT_TOLERANCES,
  showStatus = true,
}: MacroProgressProps) {
  const { label, unit } = MACRO_LABELS[macro];
  const format = macro === "calories" ? formatKcal : formatGrams;
  const status = STATUS[macroStatus(macro, actual, target, tolerances)];
  const percent = progressPercent(actual, target);

  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums">
          <span className="font-semibold">{format(actual)}</span>
          <span className="text-muted-foreground">
            {" "}
            / {format(target)} {unit}
          </span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${format(actual)} von ${format(target)} ${unit}`}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-[width]", BAR_COLOR[macro])}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showStatus ? (
        <span className={cn("text-xs font-medium", status.className)}>{status.label}</span>
      ) : null}
    </div>
  );
}
