-- Keep the author's displayed nickname consistent on older shares after a profile edit.
create or replace function public.set_my_nickname(new_nickname text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  clean_name text := btrim(new_nickname);
begin
  if actor is null then raise exception 'Sign in first'; end if;
  if clean_name is null or char_length(clean_name) < 1 or char_length(clean_name) > 30 then
    raise exception 'Nickname must be 1–30 characters';
  end if;
  insert into public.profiles(user_id,nickname,updated_at)
  values(actor,clean_name,now())
  on conflict(user_id) do update set nickname=excluded.nickname,updated_at=excluded.updated_at;
  update public.songs set nickname=clean_name where owner_id=actor and nickname is distinct from clean_name;
  update public.comments set nickname=clean_name where user_id=actor and nickname is distinct from clean_name;
  update public.posts set nickname=clean_name where owner_id=actor and nickname is distinct from clean_name;
  update public.post_comments set nickname=clean_name where user_id=actor and nickname is distinct from clean_name;
  update public.group_songs set nickname=clean_name where owner_id=actor and nickname is distinct from clean_name;
  update public.group_comments set nickname=clean_name where user_id=actor and nickname is distinct from clean_name;
  update public.playlists set nickname=clean_name where owner_id=actor and nickname is distinct from clean_name;
  update public.activity_events set actor_nickname=clean_name where actor_id=actor and actor_nickname is distinct from clean_name;
  return clean_name;
end;
$$;
revoke all on function public.set_my_nickname(text) from public;
revoke all on function public.set_my_nickname(text) from anon;
grant execute on function public.set_my_nickname(text) to authenticated;
