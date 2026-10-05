import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/features/auth/session";
import { hasCompletedOnboarding } from "@/features/profile/queries";

export const metadata: Metadata = { title: "Einrichtung" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (await hasCompletedOnboarding(user.id)) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6 sm:py-10">
      <Logo />
      <main>
        <Card>
          <CardContent className="p-5 sm:p-8">
            <OnboardingWizard />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
