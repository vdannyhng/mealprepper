-- Row Level Security integration tests. Run with `npm run test:db` (requires `npm run db:start`).
begin;
create extension if not exists pgtap with schema extensions;

select plan(19);

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

select * from finish();
rollback;
