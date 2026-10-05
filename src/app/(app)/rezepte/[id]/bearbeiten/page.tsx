import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { requireUser } from "@/features/auth/session";
import { getRecipe } from "@/features/recipes/queries";
import { isUuid } from "@/lib/validation/shared";
import { isRecipeTag } from "@/lib/recipes/labels";

export const metadata: Metadata = { title: "Rezept bearbeiten" };

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const user = await requireUser();
  const recipe = await getRecipe(id, user.id);
  // Global example recipes cannot be edited directly – they are copied first.
  if (!recipe || !recipe.isOwn) notFound();

  return (
    <>
      <PageHeader title="Rezept bearbeiten" description={recipe.name} />
      <RecipeForm
        initial={{
          id: recipe.id,
          name: recipe.name,
          description: recipe.description ?? "",
          category: recipe.category,
          tags: recipe.tags.filter(isRecipeTag),
          servings: recipe.servings,
          prepTime: recipe.prep_time,
          cookTime: recipe.cook_time,
          fridgeLifeDays: recipe.fridge_life_days,
          freezerLifeDays: recipe.freezer_life_days,
          storageNotes: recipe.storage_notes ?? "",
          instructions: recipe.instructions,
          ingredients: recipe.ingredients.map((i) => ({
            food: i.food,
            amount: i.amount,
            unit: i.unit,
            note: i.note,
          })),
        }}
      />
    </>
  );
}
