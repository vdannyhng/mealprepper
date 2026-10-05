"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/features/auth/actions";
import { Alert } from "@/components/ui/alert";
import { InputField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValues } from "@/hooks/use-form-values";
import { IDLE } from "@/lib/action-state";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, IDLE);
  const { field } = useFormValues({ email: "" });

  if (state.status === "success") return <Alert variant="success">{state.message}</Alert>;

  return (
    <form action={action} className="grid gap-4" noValidate>
      <InputField
        label="E-Mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        errors={state.status === "error" ? state.fieldErrors?.email : undefined}
        {...field("email")}
      />
      {state.status === "error" ? <Alert variant="error">{state.message}</Alert> : null}
      <SubmitButton className="w-full" pendingLabel="Wird gesendet…">
        Link senden
      </SubmitButton>
    </form>
  );
}
