import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { RecipeForm } from "@/components/recipes/recipe-form";

export const metadata: Metadata = { title: "Neues Rezept" };

export default function NewRecipePage() {
  return (
    <>
      <PageHeader
        title="Neues Rezept"
        description="Die Makros werden live aus den Zutaten berechnet."
      />
      <RecipeForm />
    </>
  );
}
