-- Self-service account deletion (data protection: right to erasure).
-- Deleting the auth user cascades to every user-owned table (on delete cascade).
-- Storage files are removed by the app via the Storage API before calling this function,
-- because Supabase does not allow deleting storage objects with SQL.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  delete from auth.users where id = v_user_id;
end;
$$;

revoke execute on function public.delete_own_account from public, anon;
grant execute on function public.delete_own_account to authenticated;
