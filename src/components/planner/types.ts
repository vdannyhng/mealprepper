import type { Nutrients } from "@/lib/nutrition/recipe";
import type { Enums } from "@/types/database";

/** Recipe as offered in the planner's library and picker. */
export interface RecipeOption {
  id: string;
  name: string;
  category: Enums<"recipe_category">;
  isOwn: boolean;
  perServing: Nutrients;
}
