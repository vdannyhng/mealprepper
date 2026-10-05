import { ChartColumn } from "lucide-react";
import type { Metadata } from "next";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Statistiken" };

export default function Page() {
  return (
    <UpcomingSection
      title="Statistiken"
      description="Durchschnittswerte, Streaks und Planerfüllung."
      icon={ChartColumn}
      emptyTitle="Noch keine Daten vorhanden."
      emptyDescription="Statistiken erscheinen, sobald du Tage und Meal-Prep-Sessions abschliesst."
    />
  );
}
