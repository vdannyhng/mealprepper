"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { formatGrams, formatKcal } from "@/lib/nutrition/format";
import { RECIPE_CATEGORY_LABELS } from "@/lib/recipes/labels";
import { cn } from "@/lib/utils";
import type { RecipeOption } from "./types";

type Category = RecipeOption["category"];

interface RecipeOptionListProps {
  recipes: RecipeOption[];
  /** Renders one recipe row (draggable item, button …). */
  renderItem: (recipe: RecipeOption, content: ReactNode) => ReactNode;
  className?: string;
}

export function RecipeOptionContent({ recipe }: { recipe: RecipeOption }) {
  return (
    <>
      <span className="block leading-snug font-medium">{recipe.name}</span>
      <span className="block text-xs text-muted-foreground tabular-nums">
        {RECIPE_CATEGORY_LABELS[recipe.category]} · {formatKcal(recipe.perServing.calories)} kcal ·{" "}
        {formatGrams(recipe.perServing.protein)} g P / Portion
      </span>
    </>
  );
}

/** Searchable, category-filtered recipe list shared by the library and the picker dialog. */
export function RecipeOptionList({ recipes, renderItem, className }: RecipeOptionListProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const q = query.trim().toLowerCase();
  const visible = recipes.filter(
    (r) => (!category || r.category === category) && (!q || r.name.toLowerCase().includes(q)),
  );

  return (
    <div className={cn("grid min-h-0 content-start gap-3", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          aria-label="Rezepte filtern"
          placeholder="Rezept suchen…"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-1" role="group" aria-label="Kategorie">
        {(Object.keys(RECIPE_CATEGORY_LABELS) as Category[]).map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(category === c ? null : c)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium",
              category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-muted",
            )}
          >
            {RECIPE_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      {visible.length ? (
        <ul className="grid min-h-0 content-start gap-1.5 overflow-y-auto">
          {visible.map((recipe) => renderItem(recipe, <RecipeOptionContent recipe={recipe} />))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Keine Rezepte gefunden.{" "}
          <Link href="/rezepte/neu" className="font-medium text-primary hover:underline">
            Neues Rezept
          </Link>
        </p>
      )}
    </div>
  );
}
