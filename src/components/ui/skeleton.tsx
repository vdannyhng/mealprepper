import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div aria-hidden className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
  );
}

export function LoadingSkeleton() {
  return (
    <div className="grid gap-4" role="status" aria-label="Wird geladen">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-56" />
    </div>
  );
}
