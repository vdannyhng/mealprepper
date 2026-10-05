import { ArrowLeft, Clock, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompleteSessionForm } from "@/components/meal-prep/complete-session-form";
import { DeleteSessionButton } from "@/components/meal-prep/delete-session-button";
import { SessionChecklist } from "@/components/meal-prep/session-checklist";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/auth/session";
import { getSession } from "@/features/meal-prep/queries";
import { formatDateTime, formatLongDate, formatShortDate } from "@/lib/dates";
import { PREP_STATUS_LABELS } from "@/lib/meal-prep/labels";
import { suggestedDuration } from "@/lib/meal-prep/session";
import { scaleIngredients } from "@/lib/nutrition/recipe";
import { formatQuantity } from "@/lib/nutrition/units";
import { formatNumber } from "@/lib/number-format";
import { formatMinutes } from "@/lib/recipes/labels";
import { isUuid } from "@/lib/validation/shared";

export const metadata: Metadata = { title: "Meal-Prep-Session" };

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const user = await requireUser();
  const session = await getSession(id);
  if (!session) notFound();

  const completed = session.status === "completed";
  const suggestedMinutes = suggestedDuration(session.startedAt, session.estimatedMinutes);

  return (
    <>
      <Link
        href="/meal-prep"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Meal Prep
      </Link>

      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Meal Prep · {formatLongDate(session.date)}
          </h1>
          <Badge>{PREP_STATUS_LABELS[session.status]}</Badge>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
          {session.coversTo ? (
            <li>
              Für {formatShortDate(session.date)} – {formatShortDate(session.coversTo)}
            </li>
          ) : null}
          <li className="flex items-center gap-1.5">
            <Users className="size-4" aria-hidden /> {session.plannedPortions ?? 0} Portionen ·{" "}
            {session.recipes.length} Rezepte
          </li>
          {session.estimatedMinutes ? (
            <li className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> geschätzt{" "}
              {formatMinutes(session.estimatedMinutes)}
            </li>
          ) : null}
        </ul>
      </header>

      {completed ? (
        <Card className="border-status-met/50">
          <CardHeader>
            <CardTitle>Erledigt 🎉</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <dl className="grid content-start gap-2 text-sm">
              {session.completedAt ? (
                <div>
                  <dt className="text-muted-foreground">Abgeschlossen</dt>
                  <dd className="font-medium">{formatDateTime(session.completedAt)}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">Portionen</dt>
                <dd className="font-medium">
                  {session.completedPortions ?? 0} von {session.plannedPortions ?? 0}
                </dd>
              </div>
              {session.durationMinutes ? (
                <div>
                  <dt className="text-muted-foreground">Dauer</dt>
                  <dd className="font-medium">{formatMinutes(session.durationMinutes)}</dd>
                </div>
              ) : null}
              {session.notes ? (
                <div>
                  <dt className="text-muted-foreground">Notiz</dt>
                  <dd>{session.notes}</dd>
                </div>
              ) : null}
            </dl>
            {session.photoUrl ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border">
                <Image
                  src={session.photoUrl}
                  alt={`Meal-Prep-Foto vom ${formatLongDate(session.date)}`}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Kochablauf</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionChecklist
              sessionId={session.id}
              initialTasks={session.tasks}
              readOnly={completed}
            />
          </CardContent>
        </Card>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Rezepte & Mengen</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {session.recipes.map((recipe) => (
                <details key={recipe.recipeId} className="group rounded-lg border">
                  <summary className="flex cursor-pointer items-center justify-between gap-2 p-3 text-sm font-medium">
                    {recipe.name}
                    <span className="text-muted-foreground tabular-nums">
                      {formatNumber(recipe.servings, 2)} Portionen
                    </span>
                  </summary>
                  <ul className="divide-y border-t text-sm">
                    {scaleIngredients(
                      recipe.ingredients,
                      recipe.recipeServings,
                      recipe.servings,
                    ).map((i, index) => (
                      <li key={index} className="flex justify-between gap-3 px-3 py-2">
                        <span>{i.name}</span>
                        <span className="font-medium tabular-nums">
                          {formatQuantity(i.amount, i.unit)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </CardContent>
          </Card>

          {!completed ? (
            <Card>
              <CardHeader>
                <CardTitle>Meal Prep abschliessen</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <CompleteSessionForm
                  sessionId={session.id}
                  userId={user.id}
                  plannedPortions={session.plannedPortions ?? 0}
                  suggestedMinutes={suggestedMinutes}
                />
                <DeleteSessionButton sessionId={session.id} />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
