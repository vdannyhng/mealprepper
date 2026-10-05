import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { requireUser } from "@/features/auth/session";
import { getProfile } from "@/features/profile/queries";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile?.onboarding_completed_at) redirect("/onboarding");

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:shadow"
      >
        Zum Inhalt springen
      </a>
      <AppSidebar displayName={profile.display_name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main
          id="main"
          className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-6 px-4 pt-6 pb-24 sm:px-6 lg:px-8 lg:pt-8 lg:pb-10"
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
