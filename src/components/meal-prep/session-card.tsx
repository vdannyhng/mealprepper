import { Camera, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { SessionSummary } from "@/features/meal-prep/queries";
import { formatShortDate, relativeDayLabel, type IsoDate } from "@/lib/dates";
import { PREP_STATUS_LABELS } from "@/lib/meal-prep/labels";
import { formatMinutes } from "@/lib/recipes/labels";

export function SessionCard({ session, today }: { session: SessionSummary; today: IsoDate }) {
  const done = session.status === "completed";
  return (
    <Link
      href={`/meal-prep/${session.id}`}
      className="grid gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{relativeDayLabel(today, session.date)}</span>
        <Badge variant={done ? "secondary" : "outline"}>{PREP_STATUS_LABELS[session.status]}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {session.recipeNames.join(", ")}
        {session.coversTo
          ? ` · für ${formatShortDate(session.date)} – ${formatShortDate(session.coversTo)}`
          : null}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span>
          {done
            ? `${session.completedPortions ?? 0} / ${session.plannedPortions ?? 0} Portionen`
            : `${session.plannedPortions ?? 0} Portionen`}
        </span>
        {!done && session.estimatedMinutes ? (
          <span className="text-muted-foreground">
            ca. {formatMinutes(session.estimatedMinutes)}
          </span>
        ) : null}
        {!done ? (
          <span className="text-muted-foreground">{session.progress} % erledigt</span>
        ) : null}
        {session.hasPhoto ? (
          <Camera className="size-4 text-muted-foreground" aria-label="mit Foto" />
        ) : null}
        <ChevronRight className="ml-auto size-4 text-muted-foreground" aria-hidden />
      </div>
    </Link>
  );
}
