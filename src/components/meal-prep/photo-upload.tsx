"use client";

import { Camera, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 10 * 1024 * 1024;

/** Picks a photo (camera on phones) and shows a local preview. */
export function PhotoUpload({ onChange }: { onChange: (file: File | null) => void }) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Release the object URL when it is replaced or the component unmounts.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function select(file: File | null) {
    if (file && file.size > MAX_BYTES) {
      setError("Das Foto ist grösser als 10 MB.");
      return;
    }
    setError(null);
    setPreview(file ? URL.createObjectURL(file) : null);
    onChange(file);
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">Foto (optional)</span>
      {preview ? (
        <div className="relative w-fit">
          {/* Local blob preview – next/image cannot optimize object URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Vorschau des Meal-Prep-Fotos"
            className="max-h-56 rounded-lg border object-cover"
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 size-8"
            aria-label="Foto entfernen"
            onClick={() => select(null)}
          >
            <X aria-hidden />
          </Button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground hover:bg-muted/40 has-focus-visible:outline-2 has-focus-visible:outline-ring"
        >
          <Camera className="size-6" aria-hidden />
          Foto deiner Meal-Prep-Boxen aufnehmen oder auswählen
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            capture="environment"
            className="sr-only"
            onChange={(e) => select(e.target.files?.[0] ?? null)}
          />
        </label>
      )}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
