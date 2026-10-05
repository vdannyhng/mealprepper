"use client";

import { PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InputField, TextareaField } from "@/components/ui/field";
import { completePrepSession } from "@/features/meal-prep/actions";
import { removeProofPhoto, uploadProofPhoto } from "@/features/meal-prep/photo-upload";
import { PhotoUpload } from "./photo-upload";

interface CompleteSessionFormProps {
  sessionId: string;
  userId: string;
  plannedPortions: number;
  /** Pre-filled duration (from start time or estimate), computed on the server. */
  suggestedMinutes: number | null;
}

export function CompleteSessionForm({
  sessionId,
  userId,
  plannedPortions,
  suggestedMinutes,
}: CompleteSessionFormProps) {
  const router = useRouter();
  const [portions, setPortions] = useState(String(plannedPortions));
  const [minutes, setMinutes] = useState(suggestedMinutes ? String(suggestedMinutes) : "");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const completedPortions = Number(portions);
    const duration = minutes.trim() ? Number(minutes) : null;
    if (!Number.isInteger(completedPortions) || completedPortions < 0) {
      setError("Bitte gib die Anzahl fertiger Portionen als ganze Zahl an.");
      return;
    }
    if (duration !== null && (!Number.isInteger(duration) || duration < 1 || duration > 1440)) {
      setError("Die Dauer muss zwischen 1 und 1440 Minuten liegen.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        let photoPath: string | null = null;
        if (photo) {
          setStep("Foto wird hochgeladen…");
          photoPath = await uploadProofPhoto(photo, userId, sessionId);
        }
        setStep("Wird gespeichert…");
        const result = await completePrepSession({
          sessionId,
          completedPortions,
          durationMinutes: duration,
          notes,
          photoPath,
        });
        if (!result.ok) {
          // Do not leave an orphaned photo in storage when the session was not saved.
          if (photoPath) await removeProofPhoto(photoPath);
          setError(result.message);
          return;
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Keine Verbindung zum Server.");
      } finally {
        setStep(null);
      }
    });
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Fertige Portionen"
          type="number"
          inputMode="numeric"
          min={0}
          hint={`Geplant: ${plannedPortions}`}
          value={portions}
          onChange={(e) => setPortions(e.target.value)}
        />
        <InputField
          label="Dauer (optional)"
          type="number"
          inputMode="numeric"
          min={1}
          suffix="min"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
      </div>
      <TextareaField
        label="Kommentar (optional)"
        rows={2}
        maxLength={2000}
        placeholder="Was lief gut, was machst du nächstes Mal anders?"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <PhotoUpload onChange={setPhoto} />
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
        <PartyPopper aria-hidden /> {step ?? "Meal Prep abgeschlossen"}
      </Button>
    </form>
  );
}
