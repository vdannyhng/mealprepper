import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { MORE_NAV } from "@/components/layout/nav-items";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Mehr" };

export default function MorePage() {
  return (
    <>
      <PageHeader title="Mehr" />
      <Card>
        <nav aria-label="Weitere Bereiche">
          <ul className="divide-y">
            {MORE_NAV.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex min-h-14 items-center gap-3 px-4 text-sm font-medium hover:bg-muted"
                >
                  <Icon className="size-5 text-muted-foreground" aria-hidden />
                  <span className="flex-1">{label}</span>
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Card>
      <SignOutButton />
    </>
  );
}
