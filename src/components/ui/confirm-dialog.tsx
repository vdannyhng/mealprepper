"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "./button";

interface ConfirmDialogProps {
  /** Label of the button that opens the dialog. */
  triggerLabel: ReactNode;
  triggerVariant?: ButtonProps["variant"];
  title: string;
  description?: ReactNode;
  /**
   * Dialog body, typically the confirming button or a form. Pass a function to receive
   * `close` when the dialog should close after a synchronous confirmation.
   */
  children: ReactNode | ((close: () => void) => ReactNode);
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
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <Button variant={triggerVariant} onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <dialog
        ref={ref}
        onClose={close}
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
          {typeof children === "function" ? children(close) : children}
          <Button variant="ghost" onClick={close}>
            Abbrechen
          </Button>
        </div>
      </dialog>
    </>
  );
}
