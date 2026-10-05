"use client";

import { useActionState } from "react";
import { signUp } from "@/features/auth/actions";
import { Alert } from "@/components/ui/alert";
import { InputField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValues } from "@/hooks/use-form-values";
import { IDLE } from "@/lib/action-state";

export function SignupForm() {
  const [state, action] = useActionState(signUp, IDLE);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const { field } = useFormValues({ displayName: "", email: "", password: "" });

  if (state.status === "success") {
    return <Alert variant="success">{state.message}</Alert>;
  }

  return (
    <form action={action} className="grid gap-4" noValidate>
      <InputField
        label="Name"
        autoComplete="given-name"
        required
        maxLength={80}
        errors={fieldErrors?.displayName}
        {...field("displayName")}
      />
      <InputField
        label="E-Mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        errors={fieldErrors?.email}
        {...field("email")}
      />
      <InputField
        label="Passwort"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="Mindestens 8 Zeichen."
        errors={fieldErrors?.password}
        {...field("password")}
      />
      {state.status === "error" ? <Alert variant="error">{state.message}</Alert> : null}
      <SubmitButton className="w-full" pendingLabel="Konto wird erstellt…">
        Konto erstellen
      </SubmitButton>
    </form>
  );
}
