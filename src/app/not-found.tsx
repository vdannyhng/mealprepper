import { SearchX } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4">
      <Logo />
      <EmptyState
        icon={SearchX}
        title="Seite nicht gefunden"
        description="Diese Seite existiert nicht oder wurde verschoben."
        action={
          <Link href="/dashboard" className={buttonVariants()}>
            Zum Dashboard
          </Link>
        }
      />
    </div>
  );
}
