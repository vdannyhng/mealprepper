import { WifiOff } from "lucide-react";
import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Offline" };
export const dynamic = "force-static";

/** Shown by the service worker when a page cannot be loaded without a connection. */
export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4">
      <Logo href="/dashboard" />
      <EmptyState
        icon={WifiOff}
        title="Du bist offline"
        description="Diese Seite braucht eine Internetverbindung. Sobald du wieder online bist, lade die Seite neu – deine gespeicherten Daten bleiben erhalten."
      />
    </div>
  );
}
