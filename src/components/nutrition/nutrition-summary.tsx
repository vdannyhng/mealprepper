import { formatGrams, formatKcal } from "@/lib/nutrition/format";
import type { Nutrients } from "@/lib/nutrition/recipe";
import { cn } from "@/lib/utils";

const ITEMS = [
  { key: "calories", label: "kcal", dot: "bg-macro-calories" },
  { key: "protein", label: "Protein", dot: "bg-macro-protein" },
  { key: "carbs", label: "Kohlenh.", dot: "bg-macro-carbs" },
  { key: "fat", label: "Fett", dot: "bg-macro-fat" },
] as const;

/** Compact four-up display of kcal / protein / carbs / fat. */
export function NutritionSummary({
  nutrients,
  className,
  size = "default",
}: {
  nutrients: Nutrients;
  className?: string;
  size?: "default" | "sm";
}) {
  return (
    <dl className={cn("grid grid-cols-4 gap-2", className)}>
      {ITEMS.map(({ key, label, dot }) => (
        <div
          key={key}
          className={cn(
            "grid gap-0.5 rounded-lg bg-muted text-center",
            size === "sm" ? "p-1.5" : "p-3",
          )}
        >
          <dt className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <span className={cn("size-1.5 rounded-full", dot)} aria-hidden />
            {label}
          </dt>
          <dd className={cn("font-semibold tabular-nums", size === "sm" ? "text-sm" : "text-lg")}>
            {key === "calories"
              ? formatKcal(nutrients.calories)
              : `${formatGrams(nutrients[key])} g`}
          </dd>
        </div>
      ))}
    </dl>
  );
}
