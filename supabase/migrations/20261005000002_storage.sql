-- Private storage buckets. Objects are stored as "<user_id>/<file>" and only the owner can
-- read, write or delete them. Clients access images via short-lived signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('meal-prep-photos', 'meal-prep-photos', false, 10485760,
   array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']),
  ('recipe-images', 'recipe-images', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', false, 2097152,
   array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "own files: select" on storage.objects for select to authenticated
  using (
    bucket_id in ('meal-prep-photos', 'recipe-images', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "own files: insert" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('meal-prep-photos', 'recipe-images', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "own files: update" on storage.objects for update to authenticated
  using (
    bucket_id in ('meal-prep-photos', 'recipe-images', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('meal-prep-photos', 'recipe-images', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "own files: delete" on storage.objects for delete to authenticated
  using (
    bucket_id in ('meal-prep-photos', 'recipe-images', 'avatars')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
