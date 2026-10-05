"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title="Diese Seite konnte nicht geladen werden"
      description="Bitte prüfe deine Verbindung und versuche es erneut. Deine gespeicherten Daten sind nicht verloren."
      action={<Button onClick={reset}>Erneut versuchen</Button>}
    />
  );
}
