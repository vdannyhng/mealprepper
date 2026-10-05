import { ChefHat } from "lucide-react";
import Link from "next/link";

export function Logo({ href = "/dashboard" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-md font-semibold tracking-tight">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ChefHat className="size-5" aria-hidden />
      </span>
      MealPrepper
    </Link>
  );
}
