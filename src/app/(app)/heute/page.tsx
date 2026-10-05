import { Sun } from "lucide-react";
import type { Metadata } from "next";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Heute" };

export default function Page() {
  return (
    <UpcomingSection
      title="Heute"
      description="Deine Mahlzeiten und Makros für heute."
      icon={Sun}
      emptyTitle="Für heute sind noch keine Mahlzeiten geplant."
      emptyDescription="Sobald dein Wochenplan steht, siehst du hier deine Mahlzeiten und kannst sie als gegessen markieren."
    />
  );
}
