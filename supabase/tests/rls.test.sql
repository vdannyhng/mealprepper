-- Row Level Security integration tests. Run with `npm run test:db` (requires `npm run db:start`).
begin;
create extension if not exists pgtap with schema extensions;

select plan(33);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'anna@example.test', '{"display_name": "Anna"}'),
  ('22222222-2222-2222-2222-222222222222', 'ben@example.test', '{}');

select is(
  (select display_name from public.profiles where user_id = '11111111-1111-1111-1111-111111111111'),
  'Anna',
  'signup trigger creates a profile with the display name'
);
select is(
  (select count(*)::int from public.user_preferences),
  2,
  'signup trigger creates default preferences'
);

-- Act as Anna
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ select public.complete_onboarding(
       'fat_loss', 2400, 180, 260, 70, null, 'omnivore', '{7,3}', 3::smallint, 1::smallint,
       'medium', '{gluten}', '{Sellerie}', '{Chicken}', '{Pilze}') $$,
  'onboarding RPC succeeds for the signed-in user'
);
select is(
  (select calories from public.macro_targets where is_default),
  2400,
  'onboarding stores the default macro target'
);
select ok(
  (select onboarding_completed_at is not null from public.profiles),
  'onboarding marks the profile as completed'
);
select is((select count(*)::int from public.profiles), 1, 'a user only sees their own profile');
select ok((select count(*) from public.food_items where user_id is null) >= 20, 'global foods are readable');
select ok((select count(*) from public.recipes where user_id is null) >= 10, 'global recipes are readable');

select throws_ok(
  $$ insert into public.macro_targets (user_id, name, calories, protein, carbs, fat)
     values ('22222222-2222-2222-2222-222222222222', 'Hack', 2000, 100, 200, 60) $$,
  '42501',
  null,
  'cannot create rows for another user'
);

update public.food_items set calories = 1 where user_id is null;
select is(
  (select count(*)::int from public.food_items where calories = 1),
  0,
  'global foods cannot be modified'
);

select lives_ok(
  $$ select public.save_recipe(
       '{"name": "Test Bowl", "category": "lunch", "servings": 2, "tags": ["meal_prep"],
         "instructions": ["Kochen"]}'::jsonb,
       jsonb_build_array(jsonb_build_object(
         'food_item_id', (select id from public.food_items where name = 'Hähnchenbrust' and user_id is null),
         'amount', 400, 'unit', 'g'))) $$,
  'save_recipe creates a recipe with ingredients'
);
select is(
  (select count(*)::int from public.recipe_ingredients ri
     join public.recipes r on r.id = ri.recipe_id where r.name = 'Test Bowl'),
  1,
  'ingredients are stored with the recipe'
);
select throws_ok(
  $$ select public.save_recipe('{"name": "X", "category": "lunch", "servings": 1}'::jsonb,
       '[{"food_item_id": "00000000-0000-0000-0000-000000000000", "amount": 1, "unit": "g"}]'::jsonb) $$,
  '23503',
  null,
  'save_recipe rejects unknown foods'
);
select ok(
  set_config('test.recipe_id', (select id::text from public.recipes where name = 'Test Bowl'), true) is not null,
  'own recipe is visible to its owner'
);

insert into public.weekly_plans (user_id, week_start_date)
values ('11111111-1111-1111-1111-111111111111', '2026-10-05');
select lives_ok(
  $$ insert into public.planned_meals (weekly_plan_id, date, meal_type, recipe_id)
     select p.id, '2026-10-05', 'lunch', r.id
     from public.weekly_plans p, public.recipes r
     where r.name = 'Chicken Rice Bowl' and r.user_id is null $$,
  'a global recipe can be planned'
);
select is(
  public.copy_planned_day('2026-10-05', '2026-10-05', array['2026-10-06', '2026-10-07']::date[]),
  2,
  'copy_planned_day copies a day to other days'
);
select throws_ok(
  $$ select public.copy_planned_day('2026-10-05', '2026-10-05', array['2026-10-20']::date[]) $$,
  '23514',
  null,
  'days outside the plan week are rejected'
);

select lives_ok(
  $$ select public.create_prep_session(
       '2026-10-04', '2026-10-06',
       jsonb_build_array(jsonb_build_object(
         'recipe_id', (select id from public.recipes where name = 'Chicken Rice Bowl' and user_id is null),
         'servings', 3)),
       '[{"title": "Reis kochen", "recipe_id": ""}, {"title": "Abfüllen"}]'::jsonb,
       60::smallint) $$,
  'create_prep_session creates a session with recipes and tasks'
);
select throws_ok(
  $$ select public.create_prep_session(
       '2026-10-04', '2026-10-06',
       jsonb_build_array(jsonb_build_object(
         'recipe_id', (select id from public.recipes where name = 'Beef Chili' and user_id is null),
         'servings', 1)),
       '[]'::jsonb, 10::smallint) $$,
  '23505',
  null,
  'only one active session per prep day'
);
select throws_ok(
  $$ select public.complete_prep_session(
       (select id from public.meal_prep_sessions), 3::smallint, 90::smallint, null,
       '22222222-2222-2222-2222-222222222222/foreign.jpg') $$,
  '42501',
  null,
  'proof photos must be in the own storage folder'
);
select lives_ok(
  $$ select public.complete_prep_session(
       (select id from public.meal_prep_sessions), 3::smallint, 90::smallint, 'Lief gut',
       '11111111-1111-1111-1111-111111111111/proof.jpg') $$,
  'complete_prep_session completes the session'
);
select is(
  (select count(*)::int from public.planned_meals where status = 'prepared'),
  2,
  'covered planned meals are marked as prepared'
);

-- Act as Ben
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is((select count(*)::int from public.macro_targets), 0, 'other users cannot see foreign targets');

select throws_ok(
  format(
    $$ select public.save_recipe('{"name": "Hijack", "category": "lunch", "servings": 1}'::jsonb,
         jsonb_build_array(jsonb_build_object(
           'food_item_id', (select id from public.food_items where name = 'Basmatireis' and user_id is null),
           'amount', 1, 'unit', 'g')),
         %L::uuid) $$,
    current_setting('test.recipe_id')),
  'P0002',
  null,
  'cannot overwrite another user''s recipe'
);

insert into public.weekly_plans (user_id, week_start_date)
values ('22222222-2222-2222-2222-222222222222', '2026-10-05');
select throws_ok(
  format(
    $$ insert into public.planned_meals (weekly_plan_id, date, meal_type, recipe_id)
       select id, '2026-10-05', 'lunch', %L::uuid from public.weekly_plans $$,
    current_setting('test.recipe_id')),
  '42501',
  null,
  'cannot plan another user''s private recipe'
);
select is((select count(*)::int from public.planned_meals), 0, 'other users cannot see foreign plans');
select is(
  (select count(*)::int from public.meal_prep_sessions),
  0,
  'other users cannot see foreign prep sessions'
);

select throws_ok(
  $$ insert into storage.objects (bucket_id, name)
     values ('meal-prep-photos', '11111111-1111-1111-1111-111111111111/proof.jpg') $$,
  '42501',
  null,
  'cannot upload into another user''s storage folder'
);

select lives_ok(
  $$ select public.delete_own_account() $$,
  'users can delete their own account'
);

reset role;
select is(
  (select count(*)::int from auth.users where id = '22222222-2222-2222-2222-222222222222'),
  0,
  'account deletion removes the auth user'
);

-- Regression: deleting a user whose own recipe is planned and uses an own food must succeed.
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
insert into public.food_items (user_id, name, calories, protein, carbs, fat)
values ('11111111-1111-1111-1111-111111111111', 'Eigener Shake', 100, 20, 2, 1);
insert into public.recipe_ingredients (recipe_id, food_item_id, amount, unit)
select r.id, f.id, 50, 'g'
from public.recipes r, public.food_items f
where r.name = 'Test Bowl' and f.name = 'Eigener Shake';
insert into public.planned_meals (weekly_plan_id, date, meal_type, recipe_id)
select p.id, '2026-10-08', 'dinner', r.id
from public.weekly_plans p, public.recipes r
where r.name = 'Test Bowl';
select lives_ok(
  $$ select public.delete_own_account() $$,
  'a user with own foods, recipes and plans can delete the account'
);
-- Deferred foreign keys are verified now instead of at commit (the test rolls back).
select lives_ok($$ set constraints all immediate $$, 'no dangling references remain');
reset role;
select is(
  (select count(*)::int from public.recipes where user_id is not null),
  0,
  'own recipes are deleted with the account'
);

select * from finish();
rollback;
