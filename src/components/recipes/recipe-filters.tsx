"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input, Select } from "@/components/ui/input";
import { RECIPE_CATEGORY_LABELS } from "@/lib/recipes/labels";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;

/** Search, category and scope filters, kept in the URL so results are shareable and server-rendered. */
export function RecipeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const scope = params.get("scope") === "mine" ? "mine" : "all";

  function update(next: Record<string, string | null>) {
    const search = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) search.set(key, value);
      else search.delete(key);
    }
    const qs = search.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  useEffect(() => {
    if (query === (params.get("q") ?? "")) return;
    const timer = setTimeout(() => update({ q: query.trim() || null }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to typing
  }, [query]);

  return (
    <div
      className={cn("grid gap-3 sm:grid-cols-[1fr_auto_auto]", pending && "opacity-70")}
      aria-busy={pending}
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          aria-label="Rezepte durchsuchen"
          placeholder="Rezept suchen…"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Select
        aria-label="Kategorie"
        value={params.get("category") ?? ""}
        onChange={(e) => update({ category: e.target.value || null })}
      >
        <option value="">Alle Kategorien</option>
        {Object.entries(RECIPE_CATEGORY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <div role="group" aria-label="Rezepte anzeigen" className="flex rounded-md border p-0.5">
        {(
          [
            ["all", "Alle"],
            ["mine", "Meine"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={scope === value}
            onClick={() => update({ scope: value === "all" ? null : value })}
            className={cn(
              "h-9 flex-1 rounded px-4 text-sm font-medium",
              scope === value ? "bg-secondary text-secondary-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
