"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Input, Label, Select } from "./input";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: ReactNode;
  errors?: string[];
  className?: string;
  children: ReactNode;
}

function FieldShell({ id, label, hint, errors, className, children }: FieldShellProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !errors?.length ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {errors?.length ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint: unknown, errors?: string[]) {
  if (errors?.length) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

type InputFieldProps = ComponentProps<"input"> & {
  label: string;
  hint?: ReactNode;
  errors?: string[];
  suffix?: string;
};

/** Labelled input with hint and validation message, wired up for screen readers. */
export function InputField({
  label,
  hint,
  errors,
  suffix,
  className,
  id,
  ...props
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const input = (
    <Input
      id={inputId}
      aria-invalid={errors?.length ? true : undefined}
      aria-describedby={describedBy(inputId, hint, errors)}
      className={suffix ? "pr-12" : undefined}
      {...props}
    />
  );
  return (
    <FieldShell id={inputId} label={label} hint={hint} errors={errors} className={className}>
      {suffix ? (
        <div className="relative">
          {input}
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
            {suffix}
          </span>
        </div>
      ) : (
        input
      )}
    </FieldShell>
  );
}

type SelectFieldProps = ComponentProps<"select"> & {
  label: string;
  hint?: ReactNode;
  errors?: string[];
};

export function SelectField({
  label,
  hint,
  errors,
  className,
  id,
  children,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <FieldShell id={selectId} label={label} hint={hint} errors={errors} className={className}>
      <Select
        id={selectId}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(selectId, hint, errors)}
        {...props}
      >
        {children}
      </Select>
    </FieldShell>
  );
}
