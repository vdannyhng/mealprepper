import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Rezepte" };

export default function Page() {
  return (
    <UpcomingSection
      title="Rezepte"
      description="Deine Rezepte mit automatisch berechneten Makros."
      icon={BookOpen}
      emptyTitle="Rezepte folgen im nächsten Schritt."
      emptyDescription="Lebensmittel und Rezepte (inkl. 10 Beispielrezepten) werden als Nächstes umgesetzt."
    />
  );
}
