-- All-time music charts are read through SECURITY INVOKER functions, so table RLS still applies.
create function public.music_alltime_top(p_genre text default null)
returns table(song jsonb,supporters bigint)
language sql stable security invoker set search_path = '' as $$
  select to_jsonb(s) as song,
    (select count(*) from public.reactions r where r.song_id=s.id and r.emoji in ('👍','❤️')) as supporters
  from public.songs s
  where p_genre is null or p_genre=any(s.genres)
  order by supporters desc,s.created_at desc,s.id
  limit 5
$$;
revoke all on function public.music_alltime_top(text) from public;
grant execute on function public.music_alltime_top(text) to anon,authenticated;

create function public.group_music_alltime_top(p_group_id uuid)
returns table(song jsonb,supporters bigint)
language sql stable security invoker set search_path = '' as $$
  select to_jsonb(s) as song,
    (select count(*) from public.group_reactions r where r.song_id=s.id and r.emoji in ('👍','❤️')) as supporters
  from public.group_songs s
  where s.group_id=p_group_id
  order by supporters desc,s.created_at desc,s.id
  limit 5
$$;
revoke all on function public.group_music_alltime_top(uuid) from public,anon;
grant execute on function public.group_music_alltime_top(uuid) to authenticated;
