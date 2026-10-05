import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FoodForm } from "@/components/foods/food-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/features/auth/session";
import { getFood } from "@/features/foods/queries";
import { isUuid } from "@/lib/validation/shared";

export const metadata: Metadata = { title: "Lebensmittel bearbeiten" };

export default async function EditFoodPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const user = await requireUser();
  const food = await getFood(id);
  // Only own foods are editable; the global catalog is read-only.
  if (!food || food.user_id !== user.id) notFound();

  return (
    <>
      <PageHeader title="Lebensmittel bearbeiten" description={food.name} />
      <Card>
        <CardContent className="pt-4 sm:pt-5">
          <FoodForm food={food} />
        </CardContent>
      </Card>
    </>
  );
}
