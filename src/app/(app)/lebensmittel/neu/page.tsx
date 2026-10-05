import type { Metadata } from "next";
import { FoodForm } from "@/components/foods/food-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Neues Lebensmittel" };

export default function NewFoodPage() {
  return (
    <>
      <PageHeader
        title="Neues Lebensmittel"
        description="Die Werte findest du auf der Nährwerttabelle der Verpackung."
      />
      <Card>
        <CardContent className="pt-4 sm:pt-5">
          <FoodForm />
        </CardContent>
      </Card>
    </>
  );
}
