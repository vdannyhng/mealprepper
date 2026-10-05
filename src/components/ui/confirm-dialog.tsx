"use client";

import { useId, useRef, type ReactNode } from "react";
import { Button, type ButtonProps } from "./button";

interface ConfirmDialogProps {
  /** Label of the button that opens the dialog. */
  triggerLabel: ReactNode;
  triggerVariant?: ButtonProps["variant"];
  title: string;
  description?: ReactNode;
  /** Dialog body, typically a form whose submit button performs the action. */
  children: ReactNode;
}

/** Accessible modal built on the native <dialog> element (focus trap and Esc handling included). */
export function ConfirmDialog({
  triggerLabel,
  triggerVariant = "outline",
  title,
  description,
  children,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  return (
    <>
      <Button variant={triggerVariant} onClick={() => ref.current?.showModal()}>
        {triggerLabel}
      </Button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        className="m-auto w-[min(calc(100vw-2rem),28rem)] rounded-xl border bg-card p-0 text-card-foreground shadow-lg backdrop:bg-black/50"
      >
        <div className="grid gap-4 p-5">
          <div className="grid gap-1">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <div className="text-sm text-muted-foreground">{description}</div>
            ) : null}
          </div>
          {children}
          <Button variant="ghost" onClick={() => ref.current?.close()}>
            Abbrechen
          </Button>
        </div>
      </dialog>
    </>
  );
}
