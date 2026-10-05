-- Fix: account deletion failed for users with own foods/recipes in use.
-- RESTRICT is checked immediately, so deleting a user (which cascades to foods, recipes and
-- plans) hit it before the referencing rows – removed by the same cascade – were gone.
-- Deferred NO ACTION constraints are checked at commit: the cascade succeeds, while deleting a
-- single food/recipe that is still in use is still rejected (SQLSTATE 23503 instead of 23001).

alter table public.recipe_ingredients
  drop constraint recipe_ingredients_food_item_id_fkey,
  add constraint recipe_ingredients_food_item_id_fkey
    foreign key (food_item_id) references public.food_items (id) on delete no action
    deferrable initially deferred;

alter table public.planned_meals
  drop constraint planned_meals_recipe_id_fkey,
  add constraint planned_meals_recipe_id_fkey
    foreign key (recipe_id) references public.recipes (id) on delete no action
    deferrable initially deferred;

alter table public.meal_prep_session_recipes
  drop constraint meal_prep_session_recipes_recipe_id_fkey,
  add constraint meal_prep_session_recipes_recipe_id_fkey
    foreign key (recipe_id) references public.recipes (id) on delete no action
    deferrable initially deferred;

alter table public.day_types
  drop constraint day_types_macro_target_id_fkey,
  add constraint day_types_macro_target_id_fkey
    foreign key (macro_target_id) references public.macro_targets (id) on delete no action
    deferrable initially deferred;

-- Performance (Supabase advisor "multiple permissive policies"): the former FOR ALL write
-- policy also applied to SELECT. Split it so reads are checked by a single policy.
drop policy "recipe ingredients: write via own recipe" on public.recipe_ingredients;

create policy "recipe ingredients: insert via own recipe" on public.recipe_ingredients
  for insert to authenticated
  with check (exists (
    select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid())
  ));

create policy "recipe ingredients: update via own recipe" on public.recipe_ingredients
  for update to authenticated
  using (exists (
    select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid())
  ));

create policy "recipe ingredients: delete via own recipe" on public.recipe_ingredients
  for delete to authenticated
  using (exists (
    select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid())
  ));
