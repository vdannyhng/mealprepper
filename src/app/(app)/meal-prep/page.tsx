import { ChefHat } from "lucide-react";
import type { Metadata } from "next";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Meal Prep" };

export default function Page() {
  return (
    <UpcomingSection
      title="Meal Prep"
      description="Deine Meal-Prep-Sessions mit Checkliste und Foto."
      icon={ChefHat}
      emptyTitle="Noch keine Meal-Prep-Session geplant."
      emptyDescription="Sessions entstehen automatisch aus deinem Wochenplan."
    />
  );
}
