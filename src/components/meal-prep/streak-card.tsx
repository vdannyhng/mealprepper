import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StreakResult, WeekStatus } from "@/lib/meal-prep/streaks";
import { cn } from "@/lib/utils";

export function StreakCard({ streak, history }: { streak: StreakResult; history: WeekStatus[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="size-4 text-primary" aria-hidden /> Meal-Prep-Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-bold tabular-nums">
            🔥 {streak.current} {streak.current === 1 ? "Woche" : "Wochen"}
          </p>
          <p className="text-sm text-muted-foreground">Rekord: {streak.longest}</p>
        </div>
        <ol className="grid grid-cols-4 gap-2 sm:grid-cols-8" aria-label="Letzte Wochen">
          {history.map((w) => (
            <li
              key={w.weekStart}
              className={cn(
                "grid justify-items-center gap-0.5 rounded-lg border p-2 text-xs",
                w.done ? "border-status-met/50 bg-status-met/10" : "bg-muted/40",
              )}
            >
              <span className="text-muted-foreground">KW {w.week}</span>
              <span aria-label={w.done ? "Meal Prep erledigt" : "kein Meal Prep"}>
                {w.done ? "✅" : "❌"}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
