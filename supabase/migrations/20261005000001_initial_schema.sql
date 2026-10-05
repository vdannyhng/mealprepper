-- MealPrepper – initial MVP schema
-- Conventions:
--   * every user-owned row carries user_id (directly or via its parent) and is protected by RLS
--   * nutrient values on food_items are per base_amount of base_unit (g or ml)
--   * weeks are ISO weeks (Monday = 1 … Sunday = 7)

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.goal_type as enum ('fat_loss', 'maintenance', 'muscle_gain');
create type public.sex_type as enum ('female', 'male', 'diverse');
create type public.activity_level as enum ('sedentary', 'light', 'moderate', 'active', 'very_active');
create type public.diet_type as enum ('omnivore', 'vegetarian', 'vegan', 'pescatarian');
create type public.variety_level as enum ('low', 'medium', 'high');
create type public.food_unit as enum ('g', 'kg', 'ml', 'l', 'piece', 'tbsp', 'tsp', 'serving');
create type public.food_category as enum (
  'protein', 'carbs', 'vegetables', 'fruit', 'dairy', 'fats', 'spices', 'sauces', 'other'
);
create type public.recipe_category as enum ('breakfast', 'lunch', 'dinner', 'snack');
create type public.meal_slot as enum ('breakfast', 'snack_1', 'lunch', 'snack_2', 'dinner');
create type public.meal_status as enum ('planned', 'prepared', 'eaten', 'skipped', 'replaced');
create type public.prep_session_status as enum ('planned', 'in_progress', 'completed', 'cancelled');
create type public.food_preference_kind as enum ('like', 'dislike');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profile & preferences
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  avatar_url text,
  goal public.goal_type,
  sex public.sex_type,
  birth_year smallint check (birth_year between 1900 and 2100),
  weight_kg numeric(5, 1) check (weight_kg > 20 and weight_kg < 500),
  height_cm numeric(5, 1) check (height_cm > 80 and height_cm < 260),
  activity_level public.activity_level,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  diet_type public.diet_type not null default 'omnivore',
  variety_level public.variety_level not null default 'medium',
  meals_per_day smallint not null default 3 check (meals_per_day between 1 and 6),
  snacks_per_day smallint not null default 1 check (snacks_per_day between 0 and 4),
  max_recipe_time smallint check (max_recipe_time between 5 and 600),
  max_prep_time smallint check (max_prep_time between 10 and 720),
  weekly_budget numeric(8, 2) check (weekly_budget >= 0),
  currency char(3) not null default 'CHF',
  -- ISO weekdays (1 = Monday … 7 = Sunday)
  prep_weekdays smallint[] not null default '{7}'
    check (prep_weekdays <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]),
  allergens text[] not null default '{}'
    check (allergens <@ array['gluten', 'lactose', 'nuts', 'peanuts', 'soy', 'eggs', 'fish',
                              'shellfish', 'sesame', 'celery', 'mustard']),
  -- Macro tolerances in percent
  tolerance_calories_pct numeric(4, 1) not null default 5 check (tolerance_calories_pct between 0 and 50),
  tolerance_protein_min_pct numeric(4, 1) not null default 95 check (tolerance_protein_min_pct between 50 and 100),
  tolerance_carbs_pct numeric(4, 1) not null default 10 check (tolerance_carbs_pct between 0 and 50),
  tolerance_fat_pct numeric(4, 1) not null default 10 check (tolerance_fat_pct between 0 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Nutrition targets
-- ---------------------------------------------------------------------------
create table public.macro_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  calories integer not null check (calories between 800 and 10000),
  protein numeric(6, 1) not null check (protein between 0 and 1000),
  carbs numeric(6, 1) not null check (carbs between 0 and 1500),
  fat numeric(6, 1) not null check (fat between 0 and 1000),
  fiber numeric(6, 1) check (fiber between 0 and 300),
  sugar numeric(6, 1) check (sugar between 0 and 1000),
  salt numeric(5, 1) check (salt between 0 and 100),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);
create unique index macro_targets_one_default_per_user
  on public.macro_targets (user_id) where is_default;

create table public.day_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  macro_target_id uuid not null references public.macro_targets (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);
create index day_types_macro_target_id_idx on public.day_types (macro_target_id);

-- ---------------------------------------------------------------------------
-- Foods (user_id null = global catalog, readable by every authenticated user)
-- ---------------------------------------------------------------------------
create table public.food_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  brand text check (char_length(brand) <= 120),
  category public.food_category not null default 'other',
  base_amount numeric(10, 2) not null default 100 check (base_amount > 0),
  base_unit text not null default 'g' check (base_unit in ('g', 'ml')),
  calories numeric(7, 2) not null check (calories >= 0 and calories <= 9000),
  protein numeric(7, 2) not null check (protein >= 0),
  carbs numeric(7, 2) not null check (carbs >= 0),
  fat numeric(7, 2) not null check (fat >= 0),
  fiber numeric(7, 2) check (fiber >= 0),
  sugar numeric(7, 2) check (sugar >= 0),
  salt numeric(7, 2) check (salt >= 0),
  -- conversion helpers for the units "Stück" and "Portion" (in base_unit)
  grams_per_piece numeric(8, 2) check (grams_per_piece > 0),
  grams_per_serving numeric(8, 2) check (grams_per_serving > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- macros cannot exceed the mass they describe (solid foods only; liquids may be denser than water)
  constraint food_items_macros_plausible
    check (base_unit <> 'g' or protein + carbs + fat <= base_amount * 1.01)
);
create unique index food_items_unique_name
  on public.food_items (
    coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    lower(name),
    lower(coalesce(brand, ''))
  );
create index food_items_user_id_idx on public.food_items (user_id);
create index food_items_name_search_idx on public.food_items (lower(name) text_pattern_ops);

-- ---------------------------------------------------------------------------
-- Recipes (user_id null = global example recipes)
-- ---------------------------------------------------------------------------
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text check (char_length(description) <= 2000),
  image_url text,
  category public.recipe_category not null default 'lunch',
  tags text[] not null default '{}',
  servings smallint not null check (servings between 1 and 100),
  prep_time smallint not null default 0 check (prep_time between 0 and 1440),
  cook_time smallint not null default 0 check (cook_time between 0 and 1440),
  total_time smallint generated always as (prep_time + cook_time) stored,
  fridge_life_days smallint check (fridge_life_days between 0 and 60),
  freezer_life_days smallint check (freezer_life_days between 0 and 730),
  storage_notes text check (char_length(storage_notes) <= 1000),
  instructions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index recipes_user_id_idx on public.recipes (user_id);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  food_item_id uuid not null references public.food_items (id) on delete restrict,
  amount numeric(10, 2) not null check (amount > 0),
  unit public.food_unit not null,
  note text check (char_length(note) <= 200),
  sort_order smallint not null default 0
);
create index recipe_ingredients_recipe_id_idx on public.recipe_ingredients (recipe_id);
create index recipe_ingredients_food_item_id_idx on public.recipe_ingredients (food_item_id);

-- ---------------------------------------------------------------------------
-- Weekly planning
-- ---------------------------------------------------------------------------
create table public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start_date date not null check (extract(isodow from week_start_date) = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

create table public.planned_meals (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid not null references public.weekly_plans (id) on delete cascade,
  date date not null,
  meal_type public.meal_slot not null,
  recipe_id uuid not null references public.recipes (id) on delete restrict,
  servings numeric(5, 2) not null default 1 check (servings > 0 and servings <= 20),
  status public.meal_status not null default 'planned',
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index planned_meals_plan_date_idx on public.planned_meals (weekly_plan_id, date);
create index planned_meals_recipe_id_idx on public.planned_meals (recipe_id);

create or replace function public.planned_meals_check_date()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_week_start date;
begin
  select week_start_date into v_week_start
  from public.weekly_plans
  where id = new.weekly_plan_id;

  if new.date < v_week_start or new.date > v_week_start + 6 then
    raise exception 'planned meal date % is outside of plan week %', new.date, v_week_start
      using errcode = '23514';
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Meal prep
-- ---------------------------------------------------------------------------
create table public.meal_prep_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  status public.prep_session_status not null default 'planned',
  started_at timestamptz,
  completed_at timestamptz,
  planned_portions smallint check (planned_portions >= 0),
  completed_portions smallint check (completed_portions >= 0),
  duration_minutes smallint check (duration_minutes between 0 and 1440),
  notes text check (char_length(notes) <= 2000),
  proof_photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meal_prep_sessions_completed_has_timestamp
    check (status <> 'completed' or completed_at is not null)
);
create index meal_prep_sessions_user_date_idx on public.meal_prep_sessions (user_id, date);

create table public.meal_prep_session_recipes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.meal_prep_sessions (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete restrict,
  servings numeric(5, 2) not null check (servings > 0),
  unique (session_id, recipe_id)
);
create index meal_prep_session_recipes_recipe_id_idx on public.meal_prep_session_recipes (recipe_id);

create table public.meal_prep_tasks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.meal_prep_sessions (id) on delete cascade,
  recipe_id uuid references public.recipes (id) on delete set null,
  title text not null check (char_length(title) between 1 and 300),
  sort_order smallint not null default 0,
  duration_minutes smallint check (duration_minutes between 0 and 1440),
  completed boolean not null default false,
  completed_at timestamptz
);
create index meal_prep_tasks_session_id_idx on public.meal_prep_tasks (session_id, sort_order);
create index meal_prep_tasks_recipe_id_idx on public.meal_prep_tasks (recipe_id);

-- ---------------------------------------------------------------------------
-- Pantry & shopping
-- ---------------------------------------------------------------------------
create table public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  food_item_id uuid not null references public.food_items (id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  unit public.food_unit not null,
  updated_at timestamptz not null default now(),
  unique (user_id, food_item_id)
);
create index pantry_items_food_item_id_idx on public.pantry_items (food_item_id);

create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start_date date not null check (extract(isodow from week_start_date) = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references public.shopping_lists (id) on delete cascade,
  food_item_id uuid references public.food_items (id) on delete cascade,
  custom_name text check (char_length(custom_name) between 1 and 120),
  category public.food_category not null default 'other',
  amount numeric(10, 2) check (amount >= 0),
  unit public.food_unit,
  checked boolean not null default false,
  is_manual boolean not null default false,
  sort_order smallint not null default 0,
  constraint shopping_list_items_has_name check (food_item_id is not null or custom_name is not null)
);
create index shopping_list_items_list_id_idx on public.shopping_list_items (shopping_list_id);
create index shopping_list_items_food_item_id_idx on public.shopping_list_items (food_item_id);

-- ---------------------------------------------------------------------------
-- Nutrition logs
-- ---------------------------------------------------------------------------
create table public.nutrition_day_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  calories numeric(7, 1) not null default 0 check (calories >= 0),
  protein numeric(6, 1) not null default 0 check (protein >= 0),
  carbs numeric(6, 1) not null default 0 check (carbs >= 0),
  fat numeric(6, 1) not null default 0 check (fat >= 0),
  completed boolean not null default false,
  target_met boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ---------------------------------------------------------------------------
-- Food exclusions & likes/dislikes
-- ---------------------------------------------------------------------------
create table public.excluded_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  food_item_id uuid references public.food_items (id) on delete cascade,
  custom_name text check (char_length(custom_name) between 1 and 120),
  created_at timestamptz not null default now(),
  constraint excluded_foods_has_name check (food_item_id is not null or custom_name is not null)
);
create index excluded_foods_user_id_idx on public.excluded_foods (user_id);
create index excluded_foods_food_item_id_idx on public.excluded_foods (food_item_id);

-- Spec name "preferred_foods" extended by kind so it holds both "Mag ich" and "Mag ich nicht".
create table public.food_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind public.food_preference_kind not null,
  food_item_id uuid references public.food_items (id) on delete cascade,
  custom_name text check (char_length(custom_name) between 1 and 120),
  created_at timestamptz not null default now(),
  constraint food_preferences_has_name check (food_item_id is not null or custom_name is not null)
);
create index food_preferences_user_id_idx on public.food_preferences (user_id);
create index food_preferences_food_item_id_idx on public.food_preferences (food_item_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger user_preferences_updated_at before update on public.user_preferences
  for each row execute function public.set_updated_at();
create trigger macro_targets_updated_at before update on public.macro_targets
  for each row execute function public.set_updated_at();
create trigger day_types_updated_at before update on public.day_types
  for each row execute function public.set_updated_at();
create trigger food_items_updated_at before update on public.food_items
  for each row execute function public.set_updated_at();
create trigger recipes_updated_at before update on public.recipes
  for each row execute function public.set_updated_at();
create trigger weekly_plans_updated_at before update on public.weekly_plans
  for each row execute function public.set_updated_at();
create trigger planned_meals_updated_at before update on public.planned_meals
  for each row execute function public.set_updated_at();
create trigger planned_meals_check_date before insert or update of date, weekly_plan_id on public.planned_meals
  for each row execute function public.planned_meals_check_date();
create trigger meal_prep_sessions_updated_at before update on public.meal_prep_sessions
  for each row execute function public.set_updated_at();
create trigger pantry_items_updated_at before update on public.pantry_items
  for each row execute function public.set_updated_at();
create trigger shopping_lists_updated_at before update on public.shopping_lists
  for each row execute function public.set_updated_at();
create trigger nutrition_day_logs_updated_at before update on public.nutrition_day_logs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New user bootstrap: profile + default preferences
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    nullif(left(coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ), 80), '')
  );

  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Onboarding: writes goal, targets, preferences and exclusions atomically
-- ---------------------------------------------------------------------------
create or replace function public.complete_onboarding(
  p_goal public.goal_type,
  p_calories integer,
  p_protein numeric,
  p_carbs numeric,
  p_fat numeric,
  p_fiber numeric,
  p_diet_type public.diet_type,
  p_prep_weekdays smallint[],
  p_meals_per_day smallint,
  p_snacks_per_day smallint,
  p_variety_level public.variety_level,
  p_allergens text[],
  p_excluded_foods text[],
  p_liked_foods text[],
  p_disliked_foods text[],
  p_sex public.sex_type default null,
  p_birth_year smallint default null,
  p_weight_kg numeric default null,
  p_height_cm numeric default null,
  p_activity_level public.activity_level default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_target_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  update public.profiles
     set goal = p_goal,
         sex = p_sex,
         birth_year = p_birth_year,
         weight_kg = p_weight_kg,
         height_cm = p_height_cm,
         activity_level = p_activity_level,
         onboarding_completed_at = coalesce(onboarding_completed_at, now())
   where user_id = v_user_id;

  insert into public.macro_targets (user_id, name, calories, protein, carbs, fat, fiber, is_default)
  values (v_user_id, 'Standard', p_calories, p_protein, p_carbs, p_fat, p_fiber, true)
  on conflict (user_id, name) do update
     set calories = excluded.calories,
         protein = excluded.protein,
         carbs = excluded.carbs,
         fat = excluded.fat,
         fiber = excluded.fiber,
         is_default = true
  returning id into v_target_id;

  insert into public.day_types (user_id, name, macro_target_id)
  values (v_user_id, 'Standard', v_target_id)
  on conflict (user_id, name) do update set macro_target_id = excluded.macro_target_id;

  insert into public.user_preferences (
    user_id, diet_type, prep_weekdays, meals_per_day, snacks_per_day, variety_level, allergens
  )
  values (
    v_user_id, p_diet_type, p_prep_weekdays, p_meals_per_day, p_snacks_per_day, p_variety_level,
    coalesce(p_allergens, '{}')
  )
  on conflict (user_id) do update
     set diet_type = excluded.diet_type,
         prep_weekdays = excluded.prep_weekdays,
         meals_per_day = excluded.meals_per_day,
         snacks_per_day = excluded.snacks_per_day,
         variety_level = excluded.variety_level,
         allergens = excluded.allergens;

  delete from public.excluded_foods where user_id = v_user_id and food_item_id is null;
  insert into public.excluded_foods (user_id, custom_name)
  select distinct v_user_id, trim(n) from unnest(coalesce(p_excluded_foods, '{}')) as n
  where trim(n) <> '';

  delete from public.food_preferences where user_id = v_user_id and food_item_id is null;
  insert into public.food_preferences (user_id, kind, custom_name)
  select distinct v_user_id, 'like'::public.food_preference_kind, trim(n)
  from unnest(coalesce(p_liked_foods, '{}')) as n
  where trim(n) <> ''
  union
  select distinct v_user_id, 'dislike'::public.food_preference_kind, trim(n)
  from unnest(coalesce(p_disliked_foods, '{}')) as n
  where trim(n) <> '';
end;
$$;

revoke execute on function public.complete_onboarding from public, anon;
grant execute on function public.complete_onboarding to authenticated;
revoke execute on function public.handle_new_user from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.macro_targets enable row level security;
alter table public.day_types enable row level security;
alter table public.food_items enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.planned_meals enable row level security;
alter table public.meal_prep_sessions enable row level security;
alter table public.meal_prep_session_recipes enable row level security;
alter table public.meal_prep_tasks enable row level security;
alter table public.pantry_items enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.nutrition_day_logs enable row level security;
alter table public.excluded_foods enable row level security;
alter table public.food_preferences enable row level security;

-- Tables owned directly via user_id: full CRUD on own rows.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'user_preferences', 'macro_targets', 'day_types', 'weekly_plans',
    'meal_prep_sessions', 'pantry_items', 'shopping_lists', 'nutrition_day_logs',
    'excluded_foods', 'food_preferences'
  ]
  loop
    execute format(
      'create policy "own rows: select" on public.%I for select to authenticated
         using (user_id = (select auth.uid()))', t);
    execute format(
      'create policy "own rows: insert" on public.%I for insert to authenticated
         with check (user_id = (select auth.uid()))', t);
    execute format(
      'create policy "own rows: update" on public.%I for update to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format(
      'create policy "own rows: delete" on public.%I for delete to authenticated
         using (user_id = (select auth.uid()))', t);
  end loop;
end;
$$;

-- Profiles and preferences are created by the signup trigger and never deleted by the client.
drop policy "own rows: delete" on public.profiles;
drop policy "own rows: delete" on public.user_preferences;

-- Global catalog (user_id null) is readable, only own rows are writable.
create policy "foods: read global and own" on public.food_items for select to authenticated
  using (user_id is null or user_id = (select auth.uid()));
create policy "foods: insert own" on public.food_items for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "foods: update own" on public.food_items for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "foods: delete own" on public.food_items for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "recipes: read global and own" on public.recipes for select to authenticated
  using (user_id is null or user_id = (select auth.uid()));
create policy "recipes: insert own" on public.recipes for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "recipes: update own" on public.recipes for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "recipes: delete own" on public.recipes for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "recipe ingredients: read via visible recipe" on public.recipe_ingredients
  for select to authenticated
  using (exists (
    select 1 from public.recipes r
    where r.id = recipe_id and (r.user_id is null or r.user_id = (select auth.uid()))
  ));
create policy "recipe ingredients: write via own recipe" on public.recipe_ingredients
  for all to authenticated
  using (exists (
    select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid())
  ));

create policy "planned meals: via own plan" on public.planned_meals
  for all to authenticated
  using (exists (
    select 1 from public.weekly_plans p where p.id = weekly_plan_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.weekly_plans p where p.id = weekly_plan_id and p.user_id = (select auth.uid())
  ));

create policy "prep session recipes: via own session" on public.meal_prep_session_recipes
  for all to authenticated
  using (exists (
    select 1 from public.meal_prep_sessions s where s.id = session_id and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.meal_prep_sessions s where s.id = session_id and s.user_id = (select auth.uid())
  ));

create policy "prep tasks: via own session" on public.meal_prep_tasks
  for all to authenticated
  using (exists (
    select 1 from public.meal_prep_sessions s where s.id = session_id and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.meal_prep_sessions s where s.id = session_id and s.user_id = (select auth.uid())
  ));

create policy "shopping items: via own list" on public.shopping_list_items
  for all to authenticated
  using (exists (
    select 1 from public.shopping_lists l where l.id = shopping_list_id and l.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.shopping_lists l where l.id = shopping_list_id and l.user_id = (select auth.uid())
  ));

-- Explicit privileges: the app only talks to the API as an authenticated user.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke all on all tables in schema public from anon;
