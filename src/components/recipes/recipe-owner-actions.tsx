"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteRecipe, duplicateRecipe } from "@/features/recipes/actions";

export function RecipeOwnerActions({ recipeId, isOwn }: { recipeId: string; isOwn: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ status: string; message?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.status === "error") setError(result.message ?? null);
    });
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {isOwn ? (
          <Link
            href={`/rezepte/${recipeId}/bearbeiten`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Pencil aria-hidden /> Bearbeiten
          </Link>
        ) : null}
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => run(() => duplicateRecipe(recipeId))}
        >
          <Copy aria-hidden /> {isOwn ? "Duplizieren" : "Als eigenes Rezept kopieren"}
        </Button>
        {isOwn ? (
          <ConfirmDialog
            triggerLabel={
              <>
                <Trash2 aria-hidden /> Löschen
              </>
            }
            title="Rezept löschen?"
            description="Das Rezept wird dauerhaft entfernt."
          >
            {error ? <Alert variant="error">{error}</Alert> : null}
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => run(() => deleteRecipe(recipeId))}
            >
              {pending ? "Wird gelöscht…" : "Endgültig löschen"}
            </Button>
          </ConfirmDialog>
        ) : null}
      </div>
      {error ? <Alert variant="error">{error}</Alert> : null}
    </div>
  );
}
