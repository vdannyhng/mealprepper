"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ACCOUNT_NAV, MAIN_NAV, isActive, type NavItem } from "./nav-items";
import { ThemeToggle } from "./theme-toggle";

function SidebarLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-secondary text-secondary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className="size-4" aria-hidden />
        {item.label}
      </Link>
    </li>
  );
}

export function AppSidebar({ displayName }: { displayName: string | null }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <nav
        aria-label="Hauptnavigation"
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-2"
      >
        <ul className="grid gap-1">
          {MAIN_NAV.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} />
          ))}
        </ul>
        <ul className="mt-auto grid gap-1 border-t pt-4">
          {ACCOUNT_NAV.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} />
          ))}
        </ul>
      </nav>
      <div className="flex items-center justify-between gap-2 border-t px-5 py-3">
        <span className="truncate text-sm text-muted-foreground">
          {displayName ?? "Mein Konto"}
        </span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
