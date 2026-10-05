"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteFood } from "@/features/foods/actions";

export function DeleteFoodButton({ foodId, name }: { foodId: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <ConfirmDialog
      triggerLabel={
        <>
          <Trash2 aria-hidden /> Löschen
        </>
      }
      title={`„${name}“ löschen?`}
      description="Lebensmittel, die noch in Rezepten verwendet werden, können nicht gelöscht werden."
    >
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Button
        variant="destructive"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await deleteFood(foodId);
            if (result.status === "error") setError(result.message);
          })
        }
      >
        {pending ? "Wird gelöscht…" : "Endgültig löschen"}
      </Button>
    </ConfirmDialog>
  );
}
