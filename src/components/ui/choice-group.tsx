"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ChoiceOption<T extends string | number> {
  value: T;
  label: string;
  description?: string;
}

interface GroupProps {
  legend: string;
  /** Visually hide the legend when a heading already labels the group. */
  hideLegend?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}

function Group({ legend, hideLegend, error, className, children }: GroupProps) {
  return (
    <fieldset className="grid gap-2">
      <legend className={cn("mb-2 text-sm font-medium", hideLegend && "sr-only")}>{legend}</legend>
      <div className={className}>{children}</div>
      {error ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

const cardClass =
  "flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-secondary has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring";

/** Large selectable cards backed by native radio inputs (keyboard accessible). */
export function RadioCardGroup<T extends string | number>({
  name,
  options,
  value,
  onChange,
  ...group
}: Omit<GroupProps, "children"> & {
  name: string;
  options: ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <Group {...group} className={cn("grid gap-3", group.className)}>
      {options.map((option) => (
        <label key={String(option.value)} className={cardClass}>
          <input
            type="radio"
            name={name}
            className="peer sr-only"
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
            {value === option.value ? <Check className="size-3" aria-hidden /> : null}
          </span>
          <span className="grid gap-0.5">
            <span className="font-medium">{option.label}</span>
            {option.description ? (
              <span className="text-sm text-muted-foreground">{option.description}</span>
            ) : null}
          </span>
        </label>
      ))}
    </Group>
  );
}

const chipClass =
  "inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border bg-card px-4 text-sm font-medium transition-colors select-none hover:bg-muted has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring";

/** Compact toggle chips backed by native checkboxes. */
export function CheckboxChipGroup<T extends string | number>({
  options,
  values,
  onChange,
  ...group
}: Omit<GroupProps, "children"> & {
  options: ChoiceOption<T>[];
  values: readonly T[];
  onChange: (values: T[]) => void;
}) {
  const toggle = (v: T) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <Group {...group} className={cn("flex flex-wrap gap-2", group.className)}>
      {options.map((option) => (
        <label key={String(option.value)} className={chipClass}>
          <input
            type="checkbox"
            className="sr-only"
            checked={values.includes(option.value)}
            onChange={() => toggle(option.value)}
          />
          {option.label}
        </label>
      ))}
    </Group>
  );
}

/** Single choice rendered as chips (e.g. numbers 1–6). */
export function RadioChipGroup<T extends string | number>({
  name,
  options,
  value,
  onChange,
  ...group
}: Omit<GroupProps, "children"> & {
  name: string;
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <Group {...group} className={cn("flex flex-wrap gap-2", group.className)}>
      {options.map((option) => (
        <label key={String(option.value)} className={cn(chipClass, "min-w-12 justify-center")}>
          <input
            type="radio"
            name={name}
            className="sr-only"
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </Group>
  );
}
