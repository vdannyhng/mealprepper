"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { applyTheme, currentTheme, subscribeTheme } from "@/lib/theme";

export function ThemeToggle() {
  // Server snapshot "light"; the icons below are switched by CSS, so there is no mismatch.
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => "light" as const);
  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => applyTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Helles Design aktivieren" : "Dunkles Design aktivieren"}
    >
      <Sun className="hidden dark:block" aria-hidden />
      <Moon className="block dark:hidden" aria-hidden />
    </Button>
  );
}
