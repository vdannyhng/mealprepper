import { Package } from "lucide-react";
import type { Metadata } from "next";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Pantry" };

export default function Page() {
  return (
    <UpcomingSection
      title="Pantry"
      description="Was du bereits zu Hause hast."
      icon={Package}
      emptyTitle="Deine Vorratskammer ist leer."
      emptyDescription="Vorhandene Mengen werden später automatisch von der Einkaufsliste abgezogen."
    />
  );
}
