"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckboxChipGroup } from "@/components/ui/choice-group";
import { formatLongDate, isoWeekday, type IsoDate } from "@/lib/dates";
import { WEEKDAY_LABELS } from "@/lib/nutrition/labels";

interface CopyDayDialogProps {
  /** Source day; null = closed. */
  from: IsoDate | null;
  dates: IsoDate[];
  busy: boolean;
  onCopy: (to: IsoDate[], replace: boolean) => void;
  onClose: () => void;
}

/** Copy a day's meals to other days ("Montag auf Di–Fr übernehmen"). */
export function CopyDayDialog({ from, dates, busy, onCopy, onClose }: CopyDayDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [to, setTo] = useState<IsoDate[]>([]);
  const [replace, setReplace] = useState(true);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (from && !dialog.open) dialog.showModal();
    if (!from && dialog.open) dialog.close();
  }, [from]);

  const options = dates
    .filter((d) => d !== from)
    .map((d) => ({ value: d, label: WEEKDAY_LABELS[isoWeekday(d)]!.short }));

  return (
    <dialog
      ref={ref}
      onClose={() => {
        setTo([]);
        onClose();
      }}
      aria-labelledby="copy-day-title"
      className="m-auto w-[min(calc(100vw-2rem),28rem)] rounded-xl border bg-card p-0 text-card-foreground shadow-lg backdrop:bg-black/50"
    >
      {from ? (
        <div className="grid gap-4 p-5">
          <div>
            <h2 id="copy-day-title" className="text-lg font-semibold">
              Tag kopieren
            </h2>
            <p className="text-sm text-muted-foreground">
              Mahlzeiten von {formatLongDate(from)} übernehmen nach:
            </p>
          </div>
          <CheckboxChipGroup
            legend="Zieltage"
            hideLegend
            options={options}
            values={to}
            onChange={setTo}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => setTo(options.map((o) => o.value))}>
              Alle Tage
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setTo(options.filter((o) => isoWeekday(o.value) <= 5).map((o) => o.value))
              }
            >
              Nur Mo–Fr
            </Button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={replace}
              onChange={(e) => setReplace(e.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            Bestehende Mahlzeiten der Zieltage ersetzen
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Abbrechen
            </Button>
            <Button disabled={!to.length || busy} onClick={() => onCopy(to, replace)}>
              {busy
                ? "Wird kopiert…"
                : `Auf ${to.length} Tag${to.length === 1 ? "" : "e"} kopieren`}
            </Button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
