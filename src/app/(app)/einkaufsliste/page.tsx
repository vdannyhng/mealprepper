import { ShoppingCart } from "lucide-react";
import type { Metadata } from "next";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Einkaufsliste" };

export default function Page() {
  return (
    <UpcomingSection
      title="Einkaufsliste"
      description="Automatisch aus deinem Wochenplan erstellt."
      icon={ShoppingCart}
      emptyTitle="Deine Einkaufsliste ist leer."
      emptyDescription="Sobald Mahlzeiten geplant sind, werden alle Zutaten hier zusammengefasst."
    />
  );
}
