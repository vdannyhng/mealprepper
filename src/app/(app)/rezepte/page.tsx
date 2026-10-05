import { BookOpen, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeFilters } from "@/components/recipes/recipe-filters";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/features/auth/session";
import { listRecipes } from "@/features/recipes/queries";
import { recipeFilterSchema } from "@/lib/validation/recipes";

export const metadata: Metadata = { title: "Rezepte" };

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const filter = recipeFilterSchema.parse(await searchParams);
  const recipes = await listRecipes(user.id, filter);
  const isFiltered = Boolean(filter.q || filter.category || filter.scope === "mine");

  return (
    <>
      <PageHeader
        title="Rezepte"
        description="Nährwerte werden automatisch aus den Zutaten berechnet."
        actions={
          <>
            <Link href="/lebensmittel" className={buttonVariants({ variant: "outline" })}>
              Lebensmittel
            </Link>
            <Link href="/rezepte/neu" className={buttonVariants()}>
              <Plus aria-hidden /> Neues Rezept
            </Link>
          </>
        }
      />
      <Suspense>
        <RecipeFilters />
      </Suspense>

      {recipes.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Rezepte">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={isFiltered ? "Keine passenden Rezepte gefunden." : "Noch keine Rezepte vorhanden."}
          description={
            isFiltered
              ? "Passe die Suche oder die Filter an."
              : "Lege dein erstes Rezept an – die Makros werden automatisch berechnet."
          }
          action={
            <Link href="/rezepte/neu" className={buttonVariants()}>
              Rezept erstellen
            </Link>
          }
        />
      )}
    </>
  );
}
