import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PageHeader } from "@/components/layout/page-header";
import { DeleteAccount } from "@/components/settings/delete-account";
import { ProfileForm } from "@/components/settings/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/auth/session";
import { getProfile } from "@/features/profile/queries";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  return (
    <>
      <PageHeader title="Profil" description={user.email ?? undefined} />
      <Card>
        <CardHeader>
          <CardTitle>Persönliche Daten</CardTitle>
          <CardDescription>
            Körperdaten sind optional und werden nur für Ernährungsempfehlungen verwendet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Konto</CardTitle>
          <CardDescription>
            Beim Löschen werden dein Konto, alle Daten und Fotos dauerhaft entfernt.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <SignOutButton />
          <DeleteAccount />
        </CardContent>
      </Card>
    </>
  );
}
