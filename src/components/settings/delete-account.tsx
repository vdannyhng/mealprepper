"use client";

import { Trash2 } from "lucide-react";
import { useActionState } from "react";
import { deleteAccount } from "@/features/account/actions";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { InputField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValues } from "@/hooks/use-form-values";
import { IDLE } from "@/lib/action-state";

export function DeleteAccount() {
  const [state, action] = useActionState(deleteAccount, IDLE);
  const { values, field } = useFormValues({ confirmation: "" });

  return (
    <ConfirmDialog
      triggerVariant="destructive"
      triggerLabel={
        <>
          <Trash2 aria-hidden /> Konto löschen
        </>
      }
      title="Konto endgültig löschen?"
      description="Alle Ziele, Pläne, Rezepte, Meal-Prep-Sessions und Fotos werden unwiderruflich gelöscht."
    >
      <form action={action} className="grid gap-4" noValidate>
        <InputField
          label="Zur Bestätigung LÖSCHEN eintippen"
          autoComplete="off"
          errors={state.status === "error" ? state.fieldErrors?.confirmation : undefined}
          {...field("confirmation")}
        />
        {state.status === "error" && !state.fieldErrors ? (
          <Alert variant="error">{state.message}</Alert>
        ) : null}
        <SubmitButton
          variant="destructive"
          disabled={values.confirmation !== "LÖSCHEN"}
          pendingLabel="Wird gelöscht…"
        >
          Endgültig löschen
        </SubmitButton>
      </form>
    </ConfirmDialog>
  );
}
