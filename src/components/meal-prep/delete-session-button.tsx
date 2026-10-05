"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deletePrepSession } from "@/features/meal-prep/actions";

export function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <ConfirmDialog
      triggerVariant="ghost"
      triggerLabel={
        <>
          <Trash2 aria-hidden /> Session verwerfen
        </>
      }
      title="Session verwerfen?"
      description="Die Checkliste wird gelöscht. Du kannst die Session danach neu aus dem aktuellen Wochenplan erstellen."
    >
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Button
        variant="destructive"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await deletePrepSession(sessionId);
            if (!result.ok) setError(result.message);
          })
        }
      >
        {pending ? "Wird verworfen…" : "Verwerfen"}
      </Button>
    </ConfirmDialog>
  );
}
