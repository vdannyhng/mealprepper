import { ArrowLeft, Clock, Refrigerator, Snowflake } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecipeOwnerActions } from "@/components/recipes/recipe-owner-actions";
import { RecipeScaler } from "@/components/recipes/recipe-scaler";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/auth/session";
import { getRecipe } from "@/features/recipes/queries";
import { isUuid } from "@/lib/validation/shared";
import { RECIPE_CATEGORY_LABELS, formatMinutes, tagLabel } from "@/lib/recipes/labels";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) return { title: "Rezept" };
  const user = await requireUser();
  const recipe = await getRecipe(id, user.id);
  return { title: recipe?.name ?? "Rezept" };
}

export default async function RecipePage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const user = await requireUser();
  const recipe = await getRecipe(id, user.id);
  if (!recipe) notFound();

  return (
    <>
      <Link
        href="/rezepte"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Alle Rezepte
      </Link>

      <header className="grid gap-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge>{RECIPE_CATEGORY_LABELS[recipe.category]}</Badge>
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tagLabel(tag)}
            </Badge>
          ))}
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{recipe.name}</h1>
        {recipe.description ? <p className="text-muted-foreground">{recipe.description}</p> : null}
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden />
            Vorbereitung {formatMinutes(recipe.prep_time)} · Kochen{" "}
            {formatMinutes(recipe.cook_time)} · Gesamt{" "}
            {formatMinutes(recipe.prep_time + recipe.cook_time)}
          </li>
          {recipe.fridge_life_days != null ? (
            <li className="flex items-center gap-1.5">
              <Refrigerator className="size-4" aria-hidden /> {recipe.fridge_life_days} Tage im
              Kühlschrank
            </li>
          ) : null}
          {recipe.freezer_life_days != null ? (
            <li className="flex items-center gap-1.5">
              <Snowflake className="size-4" aria-hidden /> {recipe.freezer_life_days} Tage
              tiefgekühlt
            </li>
          ) : null}
        </ul>
        <RecipeOwnerActions recipeId={recipe.id} isOwn={recipe.isOwn} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card>
          <CardContent className="pt-4 sm:pt-5">
            <RecipeScaler
              servings={recipe.servings}
              ingredients={recipe.ingredients.map((i) => ({
                id: i.id,
                name: i.food.brand ? `${i.food.name} (${i.food.brand})` : i.food.name,
                amount: i.amount,
                unit: i.unit,
                note: i.note,
                food: i.food,
              }))}
            />
          </CardContent>
        </Card>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Zubereitung</CardTitle>
            </CardHeader>
            <CardContent>
              {recipe.instructions.length ? (
                <ol className="grid gap-3">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-sm leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Keine Zubereitungsschritte hinterlegt.
                </p>
              )}
            </CardContent>
          </Card>
          {recipe.storage_notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Aufbewahrung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{recipe.storage_notes}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
