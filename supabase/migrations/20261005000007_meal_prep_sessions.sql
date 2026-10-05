-- Meal prep sessions generated from the weekly plan.

alter table public.meal_prep_sessions
  add column covers_to date,
  add column estimated_minutes smallint check (estimated_minutes between 0 and 1440),
  add constraint meal_prep_sessions_covers_after_date check (covers_to is null or covers_to >= date);

-- One active session per prep day.
create unique index meal_prep_sessions_one_per_day
  on public.meal_prep_sessions (user_id, date) where status <> 'cancelled';

-- Session recipes may only reference recipes the user can see (FKs bypass RLS).
drop policy "prep session recipes: via own session" on public.meal_prep_session_recipes;

create policy "prep session recipes: read via own session" on public.meal_prep_session_recipes
  for select to authenticated
  using (exists (
    select 1 from public.meal_prep_sessions s where s.id = session_id and s.user_id = (select auth.uid())
  ));

create policy "prep session recipes: delete via own session" on public.meal_prep_session_recipes
  for delete to authenticated
  using (exists (
    select 1 from public.meal_prep_sessions s where s.id = session_id and s.user_id = (select auth.uid())
  ));

create policy "prep session recipes: write own session, visible recipe" on public.meal_prep_session_recipes
  for insert to authenticated
  with check (
    exists (
      select 1 from public.meal_prep_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.recipes r
      where r.id = recipe_id and (r.user_id is null or r.user_id = (select auth.uid()))
    )
  );

-- Creates a session with its recipes and checklist in one transaction.
-- p_recipes: [{"recipe_id", "servings"}], p_tasks: [{"title", "recipe_id"}] (array order = order)
create or replace function public.create_prep_session(
  p_date date,
  p_covers_to date,
  p_recipes jsonb,
  p_tasks jsonb,
  p_estimated_minutes smallint
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if jsonb_typeof(p_recipes) <> 'array' or jsonb_array_length(p_recipes) = 0 then
    raise exception 'a session needs at least one recipe' using errcode = '23514';
  end if;

  insert into public.meal_prep_sessions (
    user_id, date, covers_to, status, planned_portions, estimated_minutes
  )
  values (
    v_user_id,
    p_date,
    p_covers_to,
    'planned',
    (select round(sum((e ->> 'servings')::numeric))::smallint from jsonb_array_elements(p_recipes) e),
    p_estimated_minutes
  )
  returning id into v_session_id;

  insert into public.meal_prep_session_recipes (session_id, recipe_id, servings)
  select v_session_id, (e ->> 'recipe_id')::uuid, (e ->> 'servings')::numeric
  from jsonb_array_elements(p_recipes) as e;

  insert into public.meal_prep_tasks (session_id, recipe_id, title, sort_order)
  select v_session_id, nullif(e ->> 'recipe_id', '')::uuid, left(e ->> 'title', 300), (ord - 1)::smallint
  from jsonb_array_elements(coalesce(p_tasks, '[]'::jsonb)) with ordinality as t (e, ord);

  return v_session_id;
end;
$$;

-- Completes a session and marks the covered planned meals as prepared.
create or replace function public.complete_prep_session(
  p_session_id uuid,
  p_completed_portions smallint,
  p_duration_minutes smallint,
  p_notes text,
  p_photo_path text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_session public.meal_prep_sessions%rowtype;
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select * into v_session
  from public.meal_prep_sessions
  where id = p_session_id and user_id = v_user_id
  for update;
  if not found then
    raise exception 'session not found' using errcode = 'P0002';
  end if;

  -- Photos must live in the user's own storage folder.
  if p_photo_path is not null and split_part(p_photo_path, '/', 1) <> v_user_id::text then
    raise exception 'invalid photo path' using errcode = '42501';
  end if;

  update public.meal_prep_sessions
     set status = 'completed',
         completed_at = now(),
         started_at = coalesce(started_at, now() - make_interval(mins => coalesce(p_duration_minutes, 0))),
         completed_portions = p_completed_portions,
         duration_minutes = p_duration_minutes,
         notes = nullif(p_notes, ''),
         proof_photo_url = coalesce(p_photo_path, proof_photo_url)
   where id = p_session_id;

  update public.planned_meals pm
     set status = 'prepared'
    from public.weekly_plans wp
   where pm.weekly_plan_id = wp.id
     and wp.user_id = v_user_id
     and pm.status = 'planned'
     and pm.date between v_session.date and coalesce(v_session.covers_to, v_session.date)
     and pm.recipe_id in (
       select recipe_id from public.meal_prep_session_recipes where session_id = p_session_id
     );
end;
$$;

revoke execute on function public.create_prep_session from public, anon;
revoke execute on function public.complete_prep_session from public, anon;
grant execute on function public.create_prep_session to authenticated;
grant execute on function public.complete_prep_session to authenticated;
