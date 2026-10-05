"use client";

import { GripVertical } from "lucide-react";
import { writeDragPayload } from "@/lib/planning/dnd";
import { RecipeOptionList } from "./recipe-option-list";
import type { RecipeOption } from "./types";

/** Desktop side panel: drag recipes from here into a day slot. */
export function RecipeLibrary({ recipes }: { recipes: RecipeOption[] }) {
  return (
    <aside
      aria-label="Rezepte zum Einplanen"
      className="hidden lg:sticky lg:top-6 lg:flex lg:max-h-[calc(100dvh-3rem)] lg:flex-col lg:gap-3 lg:self-start lg:rounded-xl lg:border lg:bg-card lg:p-4"
    >
      <div>
        <h2 className="font-semibold">Rezepte</h2>
        <p className="text-xs text-muted-foreground">In einen Slot ziehen zum Einplanen.</p>
      </div>
      <RecipeOptionList
        recipes={recipes}
        className="min-h-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)]"
        renderItem={(recipe, content) => (
          <li
            key={recipe.id}
            draggable
            onDragStart={(e) =>
              writeDragPayload(e.dataTransfer, { kind: "recipe", recipeId: recipe.id })
            }
            className="flex cursor-grab items-start gap-2 rounded-md border bg-card p-2 text-sm hover:border-primary/50 active:cursor-grabbing"
          >
            <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0">{content}</span>
          </li>
        )}
      />
    </aside>
  );
}
