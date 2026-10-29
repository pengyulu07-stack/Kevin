-- Genre charts and language charts each have their own daily allowance.
alter table public.songs drop constraint songs_daily_slot_check;
alter table public.songs add constraint songs_daily_slot_check check (daily_slot between 1 and 32767);
alter table public.group_songs drop constraint group_songs_daily_slot_check;
alter table public.group_songs add constraint group_songs_daily_slot_check check (daily_slot between 1 and 32767);

alter table public.songs add column language text not null default 'other_language';
alter table public.songs add constraint songs_language_check check
  (language in ('mandarin','english','japanese','korean','other_language'));
alter table public.group_songs add column genres text[] not null default array['other']::text[];
alter table public.group_songs add column language text not null default 'other_language';
alter table public.group_songs add constraint group_songs_language_check check
  (language in ('mandarin','english','japanese','korean','other_language'));
alter table public.group_songs add constraint group_songs_genres_check check
  (cardinality(genres) between 1 and 3 and genres <@ array[
    'pop','rock','hiphop','electronic','rnb','jazz','classical','soundtrack',
    'indie','chinese','instrumental','folk','kpop','other']::text[]);

alter table public.user_chart_follows drop constraint user_chart_follows_genre_check;
alter table public.user_chart_follows add constraint user_chart_follows_genre_check check (genre in
  ('pop','rock','hiphop','electronic','rnb','jazz','classical','soundtrack',
   'indie','chinese','instrumental','folk','kpop','other',
   'mandarin','english','japanese','korean','other_language'));
grant update (language) on public.songs to authenticated;

create index songs_owner_day_category on public.songs (owner_id,day);
create index group_songs_owner_day_category on public.group_songs (group_id,owner_id,day);

create function private.enforce_song_category_allowance()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_genre text; v_count integer; v_scope text;
begin
  if TG_TABLE_NAME='songs' then v_scope='public'; else v_scope=new.group_id::text; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    new.owner_id::text || ':' || new.day::text || ':' || v_scope, 0));
  foreach v_genre in array new.genres loop
    if TG_TABLE_NAME = 'songs' then
      select count(*) into v_count from public.songs s
      where s.owner_id=new.owner_id and s.day=new.day and v_genre=any(s.genres)
        and s.id<>new.id;
    else
      select count(*) into v_count from public.group_songs s
      where s.group_id=new.group_id and s.owner_id=new.owner_id and s.day=new.day
        and v_genre=any(s.genres) and s.id<>new.id;
    end if;
    if v_count >= 8 then raise exception 'Eight songs per category per day: %',v_genre using errcode='23514'; end if;
  end loop;
  if TG_TABLE_NAME = 'songs' then
    select count(*) into v_count from public.songs s
    where s.owner_id=new.owner_id and s.day=new.day and s.language=new.language
      and s.id<>new.id;
  else
    select count(*) into v_count from public.group_songs s
    where s.group_id=new.group_id and s.owner_id=new.owner_id and s.day=new.day
      and s.language=new.language and s.id<>new.id;
  end if;
  if v_count >= 8 then raise exception 'Eight songs per language chart per day: %',new.language using errcode='23514'; end if;
  return new;
end $$;
revoke all on function private.enforce_song_category_allowance() from public,anon,authenticated;
create trigger songs_category_allowance before insert or update of genres,language on public.songs
for each row execute function private.enforce_song_category_allowance();
create trigger group_songs_category_allowance before insert or update of genres,language on public.group_songs
for each row execute function private.enforce_song_category_allowance();

create or replace function public.music_alltime_top(p_genre text default null)
returns table(song jsonb,supporters bigint) language sql stable set search_path='' as $$
  select to_jsonb(s),
    (select count(*) from public.reactions r where r.song_id=s.id and r.emoji in ('👍','❤️'))
  from public.songs s
  where p_genre is null or p_genre=any(s.genres) or p_genre=s.language
  order by 2 desc,s.created_at desc,s.id
  limit 5
$$;
