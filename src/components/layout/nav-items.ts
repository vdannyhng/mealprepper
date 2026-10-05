import {
  BookOpen,
  CalendarDays,
  ChartColumn,
  ChefHat,
  Ellipsis,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/heute", label: "Heute", icon: Sun },
  { href: "/woche", label: "Wochenplan", icon: CalendarDays },
  { href: "/meal-prep", label: "Meal Prep", icon: ChefHat },
  { href: "/rezepte", label: "Rezepte", icon: BookOpen },
  { href: "/einkaufsliste", label: "Einkaufsliste", icon: ShoppingCart },
  { href: "/pantry", label: "Pantry", icon: Package },
  { href: "/statistiken", label: "Statistiken", icon: ChartColumn },
];

export const ACCOUNT_NAV: NavItem[] = [
  { href: "/profil", label: "Profil", icon: User },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
];

export const MORE_ITEM: NavItem = { href: "/mehr", label: "Mehr", icon: Ellipsis };

/** Bottom navigation on phones: the four core areas plus "Mehr". */
export const MOBILE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/woche", label: "Woche", icon: CalendarDays },
  { href: "/meal-prep", label: "Meal Prep", icon: ChefHat },
  { href: "/rezepte", label: "Rezepte", icon: BookOpen },
  MORE_ITEM,
];

/** Items reachable on phones only through the "Mehr" page. */
export const MORE_NAV: NavItem[] = [
  ...MAIN_NAV.filter((item) => !MOBILE_NAV.some((m) => m.href === item.href)),
  ...ACCOUNT_NAV,
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
