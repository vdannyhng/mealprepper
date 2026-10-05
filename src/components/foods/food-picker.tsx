"use client";

import { LoaderCircle, Search } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { searchFoods } from "@/features/foods/actions";
import type { Food } from "@/features/foods/queries";
import { formatKcal } from "@/lib/nutrition/format";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 250;

interface FoodPickerProps {
  label: string;
  onSelect: (food: Food) => void;
  invalid?: boolean;
  describedBy?: string;
}

/** Searchable food combobox (WAI-ARIA combobox pattern with listbox popup). */
export function FoodPicker({ label, onSelect, invalid, describedBy }: FoodPickerProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const foods = await searchFoods(query);
        if (!cancelled) {
          setResults(foods);
          setFailed(false);
          setActive(foods.length ? 0 : -1);
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  function choose(food: Food) {
    onSelect(food);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      if (open && results[active]) {
        e.preventDefault();
        choose(results[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const activeId = open && active >= 0 ? `${listId}-${active}` : undefined;

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={inputRef}
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        placeholder="Lebensmittel suchen und hinzufügen…"
        className="pl-9"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
      />
      {loading ? (
        <LoaderCircle
          className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden
        />
      ) : null}
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-card py-1 shadow-lg"
        >
          {failed ? (
            <li className="px-3 py-2 text-sm text-destructive">
              Suche fehlgeschlagen. Bitte erneut versuchen.
            </li>
          ) : results.length === 0 && !loading ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Kein Lebensmittel gefunden.{" "}
              <a
                href="/lebensmittel/neu"
                target="_blank"
                className="font-medium text-primary hover:underline"
              >
                Neues anlegen
              </a>
            </li>
          ) : (
            results.map((food, index) => (
              <li
                key={food.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(food)}
                onMouseEnter={() => setActive(index)}
                className={cn(
                  "flex cursor-pointer items-baseline justify-between gap-3 px-3 py-2 text-sm",
                  index === active && "bg-muted",
                )}
              >
                <span className="truncate">
                  {food.name}
                  {food.brand ? (
                    <span className="text-muted-foreground"> · {food.brand}</span>
                  ) : null}
                  {food.user_id ? <span className="text-muted-foreground"> · eigenes</span> : null}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {formatKcal(food.calories)} kcal / {food.base_amount} {food.base_unit}
                </span>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
