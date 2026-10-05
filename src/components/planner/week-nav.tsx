import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { addDays, formatShortDate, isoWeek, type IsoDate } from "@/lib/dates";

export function WeekNav({
  weekStart,
  currentWeekStart,
}: {
  weekStart: IsoDate;
  currentWeekStart: IsoDate;
}) {
  const { week } = isoWeek(weekStart);
  const href = (start: IsoDate) =>
    start === currentWeekStart ? "/woche" : `/woche?woche=${start}`;

  return (
    <nav aria-label="Woche wählen" className="flex flex-wrap items-center gap-2">
      <Link
        href={href(addDays(weekStart, -7))}
        className={buttonVariants({ variant: "outline", size: "icon" })}
        aria-label="Vorherige Woche"
      >
        <ChevronLeft aria-hidden />
      </Link>
      <div className="min-w-40 text-center">
        <p className="font-semibold">KW {week}</p>
        <p className="text-xs text-muted-foreground">
          {formatShortDate(weekStart)} – {formatShortDate(addDays(weekStart, 6))}
        </p>
      </div>
      <Link
        href={href(addDays(weekStart, 7))}
        className={buttonVariants({ variant: "outline", size: "icon" })}
        aria-label="Nächste Woche"
      >
        <ChevronRight aria-hidden />
      </Link>
      {weekStart !== currentWeekStart ? (
        <Link href="/woche" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Diese Woche
        </Link>
      ) : null}
    </nav>
  );
}
