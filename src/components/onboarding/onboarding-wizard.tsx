"use client";

import { ArrowLeft, ArrowRight, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { CheckboxChipGroup, RadioCardGroup, RadioChipGroup } from "@/components/ui/choice-group";
import { completeOnboarding } from "@/features/onboarding/actions";
import {
  INITIAL_WIZARD_STATE,
  WIZARD_STEPS,
  firstInvalidStep,
  stepErrors,
  validateWizard,
  type WizardState,
} from "@/features/onboarding/wizard";
import { DIET_LABELS, GOAL_LABELS, VARIETY_LABELS, WEEKDAY_LABELS } from "@/lib/nutrition/labels";
import type { FieldErrors } from "@/lib/validation/shared";
import { MacroStep } from "./macro-step";
import { PreferencesStep } from "./preferences-step";

const toOptions = <T extends string>(labels: Record<T, { label: string; description: string }>) =>
  (Object.keys(labels) as T[]).map((value) => ({ value, ...labels[value] }));

const WEEKDAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7].map((d) => ({
  value: d,
  label: WEEKDAY_LABELS[d]!.short,
}));
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => ({ value: from + i, label: String(from + i) }));

export function OnboardingWizard() {
  const [state, setState] = useState<WizardState>(INITIAL_WIZARD_STATE);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isLast = step === WIZARD_STEPS.length - 1;

  // Move focus to the step heading so screen reader and keyboard users notice the change.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step, done]);

  const update = (patch: Partial<WizardState>) => setState((s) => ({ ...s, ...patch }));
  const visibleErrors = stepErrors(errors, step);

  function next() {
    const result = validateWizard(state);
    const currentErrors = result.ok ? {} : stepErrors(result.errors, step);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    if (!result.ok) {
      // An earlier step became invalid – jump there.
      setErrors(result.errors);
      setStep(Math.max(0, firstInvalidStep(result.errors)));
      return;
    }
    setSubmitError(null);
    startTransition(async () => {
      const response = await completeOnboarding(result.data);
      if (response.status === "error") {
        setSubmitError(response.message);
        if (response.fieldErrors) setErrors(response.fieldErrors);
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="grid justify-items-center gap-4 py-10 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
          <PartyPopper className="size-8" aria-hidden />
        </div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold tracking-tight outline-none"
        >
          Dein Meal-Prep-System ist bereit.
        </h1>
        <p className="max-w-sm text-muted-foreground">
          Deine Ziele sind gespeichert. Als Nächstes planst du deine erste Woche.
        </p>
        <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
          Zum Dashboard
        </Link>
      </div>
    );
  }

  return (
    <form
      className="grid gap-6"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
    >
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">
          Schritt {step + 1} von {WIZARD_STEPS.length}
        </p>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Fortschritt Einrichtung"
          aria-valuemin={1}
          aria-valuemax={WIZARD_STEPS.length}
          aria-valuenow={step + 1}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${((step + 1) / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-2 text-2xl font-bold tracking-tight outline-none"
        >
          {WIZARD_STEPS[step]!.title}
        </h1>
      </div>

      {step === 0 && (
        <RadioCardGroup
          legend="Ziel"
          hideLegend
          name="goal"
          options={toOptions(GOAL_LABELS)}
          value={state.goal}
          onChange={(goal) => update({ goal })}
          error={visibleErrors.goal?.[0]}
        />
      )}
      {step === 1 && <MacroStep state={state} errors={visibleErrors} onChange={update} />}
      {step === 2 && (
        <RadioCardGroup
          legend="Ernährungsform"
          hideLegend
          name="dietType"
          className="sm:grid-cols-2"
          options={(Object.keys(DIET_LABELS) as WizardState["dietType"][]).map((value) => ({
            value,
            label: DIET_LABELS[value],
          }))}
          value={state.dietType}
          onChange={(dietType) => update({ dietType })}
          error={visibleErrors.dietType?.[0]}
        />
      )}
      {step === 3 && (
        <CheckboxChipGroup
          legend="Meal-Prep-Tage"
          hideLegend
          options={WEEKDAY_OPTIONS}
          values={state.prepWeekdays}
          onChange={(prepWeekdays) => update({ prepWeekdays })}
          error={visibleErrors.prepWeekdays?.[0]}
        />
      )}
      {step === 4 && (
        <div className="grid gap-6">
          <RadioChipGroup
            legend="Hauptmahlzeiten"
            name="mealsPerDay"
            options={range(1, 6)}
            value={state.mealsPerDay}
            onChange={(mealsPerDay) => update({ mealsPerDay })}
            error={visibleErrors.mealsPerDay?.[0]}
          />
          <RadioChipGroup
            legend="Snacks"
            name="snacksPerDay"
            options={range(0, 4)}
            value={state.snacksPerDay}
            onChange={(snacksPerDay) => update({ snacksPerDay })}
            error={visibleErrors.snacksPerDay?.[0]}
          />
        </div>
      )}
      {step === 5 && (
        <RadioCardGroup
          legend="Variety Level"
          hideLegend
          name="varietyLevel"
          options={toOptions(VARIETY_LABELS)}
          value={state.varietyLevel}
          onChange={(varietyLevel) => update({ varietyLevel })}
          error={visibleErrors.varietyLevel?.[0]}
        />
      )}
      {step === 6 && <PreferencesStep state={state} errors={visibleErrors} onChange={update} />}

      {submitError ? <Alert variant="error">{submitError}</Alert> : null}

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <Button
          variant="ghost"
          onClick={() => {
            setErrors({});
            setStep(step - 1);
          }}
          disabled={step === 0 || pending}
        >
          <ArrowLeft aria-hidden /> Zurück
        </Button>
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {isLast ? (pending ? "Wird gespeichert…" : "Setup abschliessen") : "Weiter"}
          {!isLast ? <ArrowRight aria-hidden /> : null}
        </Button>
      </div>
    </form>
  );
}
