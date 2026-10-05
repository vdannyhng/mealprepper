import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles = {
  info: { icon: Info, className: "border-border bg-muted text-foreground" },
  success: {
    icon: CircleCheck,
    className: "border-status-met/40 bg-status-met/10 text-foreground",
  },
  error: {
    icon: CircleAlert,
    className: "border-destructive/40 bg-destructive/10 text-foreground",
  },
} as const;

interface AlertProps {
  variant?: keyof typeof styles;
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = "info", children, className }: AlertProps) {
  const { icon: Icon, className: variantClass } = styles[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-md border p-3 text-sm",
        variantClass,
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
