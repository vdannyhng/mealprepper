-- Saves a recipe and its ingredient list in one transaction.
-- p_recipe:      {"name", "description", "category", "tags": [], "servings", "prep_time",
--                 "cook_time", "fridge_life_days", "freezer_life_days", "storage_notes",
--                 "instructions": []}
-- p_ingredients: [{"food_item_id", "amount", "unit", "note"}]  (array order = sort order)
-- p_recipe_id:   null → create, otherwise update the caller's own recipe.
-- Runs as the caller (security invoker), so RLS applies to every statement.

create or replace function public.save_recipe(
  p_recipe jsonb,
  p_ingredients jsonb,
  p_recipe_id uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_recipe_id uuid;
  v_tags text[] := coalesce(
    array(select jsonb_array_elements_text(coalesce(p_recipe -> 'tags', '[]'::jsonb))), '{}');
  v_instructions text[] := coalesce(
    array(select jsonb_array_elements_text(coalesce(p_recipe -> 'instructions', '[]'::jsonb))), '{}');
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if jsonb_typeof(p_ingredients) <> 'array' or jsonb_array_length(p_ingredients) = 0 then
    raise exception 'a recipe needs at least one ingredient' using errcode = '23514';
  end if;

  -- Every referenced food must be visible to the caller (global or own; RLS filters the rest).
  if exists (
    select 1
    from jsonb_array_elements(p_ingredients) as e
    where not exists (
      select 1 from public.food_items f where f.id = (e ->> 'food_item_id')::uuid
    )
  ) then
    raise exception 'unknown food item' using errcode = '23503';
  end if;

  if p_recipe_id is null then
    insert into public.recipes (
      user_id, name, description, category, tags, servings, prep_time, cook_time,
      fridge_life_days, freezer_life_days, storage_notes, instructions
    )
    values (
      v_user_id,
      p_recipe ->> 'name',
      nullif(p_recipe ->> 'description', ''),
      (p_recipe ->> 'category')::public.recipe_category,
      v_tags,
      (p_recipe ->> 'servings')::smallint,
      coalesce((p_recipe ->> 'prep_time')::smallint, 0),
      coalesce((p_recipe ->> 'cook_time')::smallint, 0),
      (p_recipe ->> 'fridge_life_days')::smallint,
      (p_recipe ->> 'freezer_life_days')::smallint,
      nullif(p_recipe ->> 'storage_notes', ''),
      v_instructions
    )
    returning id into v_recipe_id;
  else
    update public.recipes
       set name = p_recipe ->> 'name',
           description = nullif(p_recipe ->> 'description', ''),
           category = (p_recipe ->> 'category')::public.recipe_category,
           tags = v_tags,
           servings = (p_recipe ->> 'servings')::smallint,
           prep_time = coalesce((p_recipe ->> 'prep_time')::smallint, 0),
           cook_time = coalesce((p_recipe ->> 'cook_time')::smallint, 0),
           fridge_life_days = (p_recipe ->> 'fridge_life_days')::smallint,
           freezer_life_days = (p_recipe ->> 'freezer_life_days')::smallint,
           storage_notes = nullif(p_recipe ->> 'storage_notes', ''),
           instructions = v_instructions
     where id = p_recipe_id
       and user_id = v_user_id
    returning id into v_recipe_id;

    if v_recipe_id is null then
      raise exception 'recipe not found' using errcode = 'P0002';
    end if;

    delete from public.recipe_ingredients where recipe_id = v_recipe_id;
  end if;

  insert into public.recipe_ingredients (recipe_id, food_item_id, amount, unit, note, sort_order)
  select
    v_recipe_id,
    (e ->> 'food_item_id')::uuid,
    (e ->> 'amount')::numeric,
    (e ->> 'unit')::public.food_unit,
    nullif(e ->> 'note', ''),
    (ord - 1)::smallint
  from jsonb_array_elements(p_ingredients) with ordinality as t (e, ord);

  return v_recipe_id;
end;
$$;

revoke execute on function public.save_recipe from public, anon;
grant execute on function public.save_recipe to authenticated;
