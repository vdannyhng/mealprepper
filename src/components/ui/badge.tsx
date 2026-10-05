import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "secondary",
  ...props
}: ComponentProps<"span"> & { variant?: "secondary" | "outline" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "secondary" ? "bg-secondary text-secondary-foreground" : "border",
        className,
      )}
      {...props}
    />
  );
}
