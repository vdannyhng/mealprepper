"use client";

import { useActionState } from "react";
import { updatePassword } from "@/features/auth/actions";
import { Alert } from "@/components/ui/alert";
import { InputField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValues } from "@/hooks/use-form-values";
import { IDLE } from "@/lib/action-state";

export function UpdatePasswordForm() {
  const [state, action] = useActionState(updatePassword, IDLE);
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const { field } = useFormValues({ password: "", passwordConfirm: "" });

  return (
    <form action={action} className="grid gap-4" noValidate>
      <InputField
        label="Neues Passwort"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        errors={errors?.password}
        {...field("password")}
      />
      <InputField
        label="Passwort wiederholen"
        type="password"
        autoComplete="new-password"
        required
        errors={errors?.passwordConfirm}
        {...field("passwordConfirm")}
      />
      {state.status === "error" ? <Alert variant="error">{state.message}</Alert> : null}
      <SubmitButton className="w-full" pendingLabel="Wird gespeichert…">
        Passwort speichern
      </SubmitButton>
    </form>
  );
}
