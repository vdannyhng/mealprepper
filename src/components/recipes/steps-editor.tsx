"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export interface StepRow {
  key: string;
  text: string;
}

export function newStepRow(text = ""): StepRow {
  return { key: crypto.randomUUID(), text };
}

export function StepsEditor({
  steps,
  onChange,
}: {
  steps: StepRow[];
  onChange: (s: StepRow[]) => void;
}) {
  function move(index: number, delta: number) {
    const next = [...steps];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(index + delta, 0, item);
    onChange(next);
  }

  return (
    <div className="grid gap-3">
      <ol className="grid gap-2">
        {steps.map((step, index) => (
          <li key={step.key} className="flex gap-2">
            <span className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {index + 1}
            </span>
            <Textarea
              aria-label={`Schritt ${index + 1}`}
              rows={2}
              maxLength={1000}
              value={step.text}
              onChange={(e) =>
                onChange(
                  steps.map((s) => (s.key === step.key ? { ...s, text: e.target.value } : s)),
                )
              }
            />
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Schritt ${index + 1} nach oben`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Schritt ${index + 1} nach unten`}
                disabled={index === steps.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Schritt ${index + 1} entfernen`}
                onClick={() => onChange(steps.filter((s) => s.key !== step.key))}
              >
                <X aria-hidden />
              </Button>
            </div>
          </li>
        ))}
      </ol>
      <Button
        variant="outline"
        className="w-fit"
        onClick={() => onChange([...steps, newStepRow()])}
      >
        <Plus aria-hidden /> Schritt hinzufügen
      </Button>
    </div>
  );
}
