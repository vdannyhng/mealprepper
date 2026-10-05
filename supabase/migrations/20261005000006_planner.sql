-- Weekly planner: stricter planned_meals policy and atomic "copy day".

-- Planned meals may only reference recipes the user can see (global or own).
-- Foreign keys bypass RLS, so without this check a private recipe id of another user
-- could be planned.
drop policy "planned meals: via own plan" on public.planned_meals;

create policy "planned meals: read via own plan" on public.planned_meals
  for select to authenticated
  using (exists (
    select 1 from public.weekly_plans p where p.id = weekly_plan_id and p.user_id = (select auth.uid())
  ));

create policy "planned meals: delete via own plan" on public.planned_meals
  for delete to authenticated
  using (exists (
    select 1 from public.weekly_plans p where p.id = weekly_plan_id and p.user_id = (select auth.uid())
  ));

create policy "planned meals: insert own plan, visible recipe" on public.planned_meals
  for insert to authenticated
  with check (
    exists (
      select 1 from public.weekly_plans p
      where p.id = weekly_plan_id and p.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.recipes r
      where r.id = recipe_id and (r.user_id is null or r.user_id = (select auth.uid()))
    )
  );

create policy "planned meals: update own plan, visible recipe" on public.planned_meals
  for update to authenticated
  using (exists (
    select 1 from public.weekly_plans p where p.id = weekly_plan_id and p.user_id = (select auth.uid())
  ))
  with check (
    exists (
      select 1 from public.weekly_plans p
      where p.id = weekly_plan_id and p.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.recipes r
      where r.id = recipe_id and (r.user_id is null or r.user_id = (select auth.uid()))
    )
  );

-- Copies all meals of one day to other days of the same plan week.
-- p_replace = true removes existing meals on the target days first.
-- Returns the number of copied meals.
create or replace function public.copy_planned_day(
  p_week_start date,
  p_from date,
  p_to date[],
  p_replace boolean default true
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan_id uuid;
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select id into v_plan_id
  from public.weekly_plans
  where user_id = v_user_id and week_start_date = p_week_start;

  if v_plan_id is null then
    raise exception 'plan not found' using errcode = 'P0002';
  end if;

  if p_replace then
    delete from public.planned_meals
    where weekly_plan_id = v_plan_id and date = any (p_to) and date <> p_from;
  end if;

  insert into public.planned_meals (weekly_plan_id, date, meal_type, recipe_id, servings, sort_order)
  select v_plan_id, t.day, m.meal_type, m.recipe_id, m.servings, m.sort_order
  from public.planned_meals m
  cross join unnest(p_to) as t (day)
  where m.weekly_plan_id = v_plan_id and m.date = p_from and t.day <> p_from;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.copy_planned_day from public, anon;
grant execute on function public.copy_planned_day to authenticated;
