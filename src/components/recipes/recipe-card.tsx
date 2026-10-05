import { Clock, Users } from "lucide-react";
import Link from "next/link";
import { NutritionSummary } from "@/components/nutrition/nutrition-summary";
import { Badge } from "@/components/ui/badge";
import type { RecipeSummary } from "@/features/recipes/queries";
import { RECIPE_CATEGORY_LABELS, formatMinutes, tagLabel } from "@/lib/recipes/labels";

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <li>
      <Link
        href={`/rezepte/${recipe.id}`}
        className="grid h-full gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/40"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge>{RECIPE_CATEGORY_LABELS[recipe.category]}</Badge>
          {recipe.isOwn ? <Badge variant="outline">Eigenes Rezept</Badge> : null}
          {recipe.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">
              {tagLabel(tag)}
            </Badge>
          ))}
        </div>
        <div className="grid gap-1">
          <h2 className="leading-snug font-semibold">{recipe.name}</h2>
          {recipe.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
          ) : null}
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden /> {formatMinutes(recipe.totalTime)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" aria-hidden /> {recipe.servings} Portionen
          </span>
        </div>
        <div className="mt-auto grid gap-1">
          <span className="text-xs text-muted-foreground">Pro Portion</span>
          <NutritionSummary nutrients={recipe.perServing} size="sm" />
        </div>
      </Link>
    </li>
  );
}
