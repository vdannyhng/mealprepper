"use client";

import { ChefHat } from "lucide-react";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createPrepSession } from "@/features/meal-prep/actions";

export function CreateSessionButton({ date, disabled }: { date: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-2">
      <Button
        disabled={disabled || pending}
        aria-busy={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            // On success the action redirects to the new session.
            const result = await createPrepSession(date);
            if (!result.ok) setError(result.message);
          })
        }
      >
        <ChefHat aria-hidden /> {pending ? "Wird erstellt…" : "Session erstellen"}
      </Button>
      {error ? <Alert variant="error">{error}</Alert> : null}
    </div>
  );
}
