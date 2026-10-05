"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RecipeOptionList } from "./recipe-option-list";
import type { RecipeOption } from "./types";

interface RecipePickerDialogProps {
  /** Heading context, e.g. "Montag, 5. Oktober · Mittagessen"; null = closed. */
  target: string | null;
  recipes: RecipeOption[];
  onPick: (recipeId: string) => void;
  onClose: () => void;
}

/** Modal recipe chooser – the keyboard and touch alternative to drag-and-drop. */
export function RecipePickerDialog({ target, recipes, onPick, onClose }: RecipePickerDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (target && !dialog.open) {
      dialog.showModal();
      // React does not render autoFocus as an attribute, so focus the search explicitly.
      dialog.querySelector<HTMLInputElement>("input[type=search]")?.focus();
    }
    if (!target && dialog.open) dialog.close();
  }, [target]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="recipe-picker-title"
      className="m-auto h-[min(40rem,calc(100dvh-2rem))] w-[min(calc(100vw-2rem),32rem)] rounded-xl border bg-card p-0 text-card-foreground shadow-lg backdrop:bg-black/50"
    >
      {target ? (
        <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 id="recipe-picker-title" className="text-lg font-semibold">
                Rezept einplanen
              </h2>
              <p className="text-sm text-muted-foreground">{target}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Schliessen" onClick={onClose}>
              <X aria-hidden />
            </Button>
          </div>
          <RecipeOptionList
            recipes={recipes}
            className="grid-rows-[auto_auto_minmax(0,1fr)]"
            renderItem={(recipe, content) => (
              <li key={recipe.id}>
                <button
                  type="button"
                  onClick={() => onPick(recipe.id)}
                  className="w-full rounded-md border p-2.5 text-left text-sm hover:border-primary/50 hover:bg-muted"
                >
                  {content}
                </button>
              </li>
            )}
          />
        </div>
      ) : null}
    </dialog>
  );
}
