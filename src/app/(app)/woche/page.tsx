import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Wochenplan" };

export default function Page() {
  return (
    <UpcomingSection
      title="Wochenplan"
      description="Plane Montag bis Sonntag passend zu deinen Makrozielen."
      icon={CalendarDays}
      emptyTitle="Für diese Woche sind noch keine Mahlzeiten geplant."
      emptyDescription="Der Wochenplaner mit Drag-and-Drop und Tagesmakros wird nach Lebensmitteln und Rezepten umgesetzt."
    />
  );
}
