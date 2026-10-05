"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { sendMagicLink, signIn, signInWithGoogle } from "@/features/auth/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValues } from "@/hooks/use-form-values";
import { IDLE } from "@/lib/action-state";

interface LoginFormProps {
  next: string;
  googleEnabled: boolean;
}

export function LoginForm({ next, googleEnabled }: LoginFormProps) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [passwordState, passwordAction] = useActionState(signIn, IDLE);
  const [magicState, magicAction] = useActionState(sendMagicLink, IDLE);
  const { field } = useFormValues({ email: "", password: "" });
  const state = mode === "password" ? passwordState : magicState;
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <div className="grid gap-4">
      <form
        action={mode === "password" ? passwordAction : magicAction}
        className="grid gap-4"
        noValidate
      >
        <input type="hidden" name="next" value={next} />
        <InputField
          label="E-Mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          errors={fieldErrors?.email}
          {...field("email")}
        />
        {mode === "password" ? (
          <InputField
            label="Passwort"
            type="password"
            autoComplete="current-password"
            required
            errors={fieldErrors?.password}
            {...field("password")}
          />
        ) : null}
        {mode === "password" ? (
          <Link
            href="/passwort-vergessen"
            className="-mt-2 justify-self-end text-sm text-primary underline-offset-4 hover:underline"
          >
            Passwort vergessen?
          </Link>
        ) : null}

        {state.status === "error" ? <Alert variant="error">{state.message}</Alert> : null}
        {state.status === "success" && state.message ? (
          <Alert variant="success">{state.message}</Alert>
        ) : null}

        <SubmitButton className="w-full" pendingLabel="Bitte warten…">
          {mode === "password" ? "Anmelden" : "Anmelde-Link senden"}
        </SubmitButton>
      </form>

      <Button
        variant="link"
        size="sm"
        onClick={() => setMode(mode === "password" ? "magic" : "password")}
      >
        {mode === "password" ? "Stattdessen per E-Mail-Link anmelden" : "Mit Passwort anmelden"}
      </Button>

      {googleEnabled ? (
        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <SubmitButton variant="outline" className="w-full">
            Mit Google anmelden
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
