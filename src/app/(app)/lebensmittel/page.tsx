import { Apple, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DeleteFoodButton } from "@/components/foods/delete-food-button";
import { FoodSearch } from "@/components/foods/food-search";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/features/auth/session";
import { findFoods } from "@/features/foods/queries";
import { formatGrams, formatKcal } from "@/lib/nutrition/format";
import { FOOD_CATEGORY_LABELS } from "@/lib/recipes/labels";

export const metadata: Metadata = { title: "Lebensmittel" };

export default async function FoodsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; gespeichert?: string }>;
}) {
  const user = await requireUser();
  const { q, gespeichert } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const foods = await findFoods({ query: query || undefined });

  return (
    <>
      <PageHeader
        title="Lebensmittel"
        description="Standard-Lebensmittel und deine eigenen Einträge."
        actions={
          <Link href="/lebensmittel/neu" className={buttonVariants()}>
            <Plus aria-hidden /> Neues Lebensmittel
          </Link>
        }
      />
      {gespeichert ? <Alert variant="success">Lebensmittel gespeichert.</Alert> : null}
      <Suspense>
        <FoodSearch />
      </Suspense>

      {foods.length ? (
        <ul className="divide-y rounded-xl border bg-card" aria-label="Lebensmittel">
          {foods.map((food) => {
            const isOwn = food.user_id === user.id;
            return (
              <li key={food.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <div className="grid min-w-0 flex-1 gap-0.5">
                  <span className="flex flex-wrap items-center gap-2 font-medium">
                    {food.name}
                    {food.brand ? (
                      <span className="text-sm font-normal text-muted-foreground">
                        {food.brand}
                      </span>
                    ) : null}
                    {isOwn ? <Badge variant="outline">Eigenes</Badge> : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {FOOD_CATEGORY_LABELS[food.category]} · pro {food.base_amount} {food.base_unit}:{" "}
                    {formatKcal(food.calories)} kcal · P {formatGrams(food.protein)} g · K{" "}
                    {formatGrams(food.carbs)} g · F {formatGrams(food.fat)} g
                  </span>
                </div>
                {isOwn ? (
                  <div className="flex gap-2">
                    <Link
                      href={`/lebensmittel/${food.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      <Pencil aria-hidden /> Bearbeiten
                    </Link>
                    <DeleteFoodButton foodId={food.id} name={food.name} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={Apple}
          title={query ? `Nichts gefunden für „${query}“.` : "Noch keine Lebensmittel vorhanden."}
          action={
            <Link href="/lebensmittel/neu" className={buttonVariants()}>
              Lebensmittel anlegen
            </Link>
          }
        />
      )}
    </>
  );
}
