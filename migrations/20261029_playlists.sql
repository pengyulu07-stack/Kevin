-- Long-lived playlists are independent of the daily song charts.
create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid references public.music_groups(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 100),
  nickname text not null check (char_length(btrim(nickname)) between 1 and 30),
  description text not null default '' check (char_length(description)<=500),
  source_url text check (source_url is null or source_url ~ '^https://[^[:space:]]{1,2048}$'),
  cover_path text unique,
  genre text not null default 'other' check (genre in
    ('pop','rock','hiphop','electronic','rnb','jazz','classical','soundtrack',
     'indie','chinese','instrumental','folk','kpop','other')),
  language text not null default 'other_language' check (language in
    ('mandarin','english','japanese','korean','other_language')),
  created_at timestamptz not null default now(),
  constraint playlist_cover_path check (cover_path is null or
    cover_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/cover\.(jpg|png|webp)$')
);
create index playlists_public_recent on public.playlists (created_at desc) where group_id is null;
create index playlists_group_recent on public.playlists (group_id,created_at desc) where group_id is not null;
alter table public.playlists enable row level security;
create policy "Read public or joined playlists" on public.playlists for select to anon,authenticated
 using (group_id is null or exists(select 1 from public.music_group_members m
   where m.group_id=playlists.group_id and m.user_id=(select auth.uid())));
create policy "Create own playlist" on public.playlists for insert to authenticated
 with check (owner_id=(select auth.uid()) and
   nickname=(select p.nickname from public.profiles p where p.user_id=(select auth.uid())) and
   (group_id is null or exists(select 1 from public.music_group_members m
     where m.group_id=playlists.group_id and m.user_id=(select auth.uid()))) and
   (cover_path is null or split_part(cover_path,'/',1)=owner_id::text and
     split_part(cover_path,'/',2)=id::text));
create policy "Update own playlist" on public.playlists for update to authenticated
 using (owner_id=(select auth.uid()))
 with check (owner_id=(select auth.uid()) and
   nickname=(select p.nickname from public.profiles p where p.user_id=(select auth.uid())) and
   (group_id is null or exists(select 1 from public.music_group_members m
     where m.group_id=playlists.group_id and m.user_id=(select auth.uid()))) and
   (cover_path is null or split_part(cover_path,'/',1)=owner_id::text and
     split_part(cover_path,'/',2)=id::text));
create policy "Delete own playlist" on public.playlists for delete to authenticated
 using (owner_id=(select auth.uid()));
grant select on public.playlists to anon,authenticated;
grant insert,update,delete on public.playlists to authenticated;

create table public.playlist_tracks (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  position smallint not null check (position between 1 and 200),
  title text not null check (char_length(btrim(title)) between 1 and 150),
  artist text not null default '' check (char_length(artist)<=150),
  album text not null default '' check (char_length(album)<=150),
  art_url text check (art_url is null or art_url ~ '^https://[^[:space:]]{1,2048}$'),
  unique (playlist_id,position)
);
create index playlist_tracks_playlist_order on public.playlist_tracks (playlist_id,position);
alter table public.playlist_tracks enable row level security;
create policy "Read tracks in visible playlists" on public.playlist_tracks for select to anon,authenticated
 using (exists(select 1 from public.playlists p where p.id=playlist_id));
create policy "Add tracks to own playlist" on public.playlist_tracks for insert to authenticated
 with check (exists(select 1 from public.playlists p
   where p.id=playlist_id and p.owner_id=(select auth.uid())));
create policy "Edit tracks in own playlist" on public.playlist_tracks for update to authenticated
 using (exists(select 1 from public.playlists p where p.id=playlist_id and p.owner_id=(select auth.uid())))
 with check (exists(select 1 from public.playlists p where p.id=playlist_id and p.owner_id=(select auth.uid())));
create policy "Remove tracks from own playlist" on public.playlist_tracks for delete to authenticated
 using (exists(select 1 from public.playlists p where p.id=playlist_id and p.owner_id=(select auth.uid())));
grant select on public.playlist_tracks to anon,authenticated;
grant insert,update,delete on public.playlist_tracks to authenticated;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('playlist-covers','playlist-covers',false,1048576,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy "View permitted playlist covers" on storage.objects for select to anon,authenticated
 using (bucket_id='playlist-covers' and exists(select 1 from public.playlists p
   where p.cover_path=name));
create policy "Upload cover to own playlist" on storage.objects for insert to authenticated
 with check (bucket_id='playlist-covers' and exists(select 1 from public.playlists p
   where p.id::text=split_part(name,'/',2) and p.owner_id=(select auth.uid())
     and split_part(name,'/',1)=(select auth.uid())::text));
create policy "Replace cover on own playlist" on storage.objects for update to authenticated
 using (bucket_id='playlist-covers' and exists(select 1 from public.playlists p
   where p.id::text=split_part(name,'/',2) and p.owner_id=(select auth.uid())))
 with check (bucket_id='playlist-covers' and exists(select 1 from public.playlists p
   where p.id::text=split_part(name,'/',2) and p.owner_id=(select auth.uid())
     and split_part(name,'/',1)=(select auth.uid())::text));

create function public.publish_playlist(
  p_title text,p_description text,p_source_url text,p_genre text,p_language text,
  p_group_id uuid,p_tracks jsonb)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_id uuid; v_count integer;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if pg_catalog.jsonb_typeof(p_tracks)<>'array' then raise exception 'Add a track list'; end if;
  v_count:=pg_catalog.jsonb_array_length(p_tracks);
  if v_count<1 or v_count>200 then raise exception 'A playlist needs 1–200 songs'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(auth.uid()::text||':playlists',0));
  if (select count(*) from public.playlists where owner_id=auth.uid())>=30 then
    raise exception 'This account has reached its 30-playlist limit';
  end if;
  insert into public.playlists(owner_id,group_id,title,nickname,description,source_url,genre,language)
  values(auth.uid(),p_group_id,pg_catalog.btrim(p_title),
    (select nickname from public.profiles where user_id=auth.uid()),
    coalesce(p_description,''),p_source_url,p_genre,p_language)
  returning id into v_id;
  insert into public.playlist_tracks(playlist_id,position,title,artist,album,art_url)
  select v_id,n::smallint,pg_catalog.btrim(item->>'title'),
    coalesce(item->>'artist',''),coalesce(item->>'album',''),
    nullif(item->>'art_url','')
  from pg_catalog.jsonb_array_elements(p_tracks) with ordinality as t(item,n);
  return v_id;
end $$;
revoke all on function public.publish_playlist(text,text,text,text,text,uuid,jsonb) from public,anon;
grant execute on function public.publish_playlist(text,text,text,text,text,uuid,jsonb) to authenticated;
