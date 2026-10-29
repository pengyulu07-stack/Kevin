-- Author edits and a small, public catalogue of member-created music charts.
create table public.music_categories (
  id text primary key default ('custom_' || replace(gen_random_uuid()::text, '-', '')),
  name text not null check (char_length(btrim(name)) between 2 and 30 and name !~ '[[:cntrl:]]'),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint music_category_id_format check (id ~ '^custom_[0-9a-f]{32}$')
);
create unique index music_categories_unique_name on public.music_categories (lower(btrim(name)));
create index music_categories_owner on public.music_categories (owner_id);
alter table public.music_categories enable row level security;
create policy "Everyone reads music categories" on public.music_categories for select to anon,authenticated using (true);
create policy "Members create own categories" on public.music_categories for insert to authenticated
  with check (owner_id=(select auth.uid()) and created_at between now()-interval '1 minute' and now()+interval '1 minute');
grant select on public.music_categories to anon,authenticated;
grant insert on public.music_categories to authenticated;

create function private.limit_music_categories() returns trigger language plpgsql security definer set search_path='' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.owner_id::text||':music_categories',0));
  new.name:=pg_catalog.btrim(new.name);
  if pg_catalog.lower(new.name)=any(array['pop','rock','hip-hop & rap','electronic','r&b / soul','jazz','classical','soundtrack','chinese music','instrumental','folk','k-pop','indie','other','chinese','english','japanese','korean','other languages','all music']) then
    raise exception 'This category already exists' using errcode='23505';
  end if;
  if (select count(*) from public.music_categories c where c.owner_id=new.owner_id)>=3 then
    raise exception 'You can create up to three music categories' using errcode='23514';
  end if;
  return new;
end $$;
revoke all on function private.limit_music_categories() from public,anon,authenticated;
create trigger limit_music_categories before insert on public.music_categories
  for each row execute function private.limit_music_categories();

alter table public.songs drop constraint songs_genre_check;
alter table public.songs drop constraint songs_genres_check;
alter table public.songs add constraint songs_genres_cardinality check (cardinality(genres) between 1 and 3);
alter table public.group_songs drop constraint group_songs_genres_check;
alter table public.group_songs add constraint group_songs_genres_cardinality check (cardinality(genres) between 1 and 3);
alter table public.playlists drop constraint playlists_genre_check;
alter table public.user_chart_follows drop constraint user_chart_follows_genre_check;

create function private.check_music_categories() returns trigger language plpgsql security definer set search_path='' as $$
declare v_key text; v_known text[]:=array['pop','rock','hiphop','electronic','rnb','jazz','classical','soundtrack','indie','chinese','instrumental','folk','kpop','other'];
begin
  if TG_TABLE_NAME in ('songs','group_songs') then
    if cardinality(new.genres) not between 1 and 3 then raise exception 'Choose one to three categories' using errcode='23514'; end if;
    if (select count(distinct x) from unnest(new.genres) as x)<>cardinality(new.genres) then raise exception 'Duplicate categories are not allowed' using errcode='23514'; end if;
    foreach v_key in array new.genres loop
      if not (v_key=any(v_known) or exists(select 1 from public.music_categories c where c.id=v_key)) then
        raise exception 'Unknown music category' using errcode='23514';
      end if;
    end loop;
    if TG_TABLE_NAME='songs' then new.genre:=new.genres[1]; end if;
  elsif TG_TABLE_NAME='playlists' then
    if not (new.genre=any(v_known) or exists(select 1 from public.music_categories c where c.id=new.genre)) then
      raise exception 'Unknown music category' using errcode='23514';
    end if;
  else
    if not (new.genre=any(v_known) or new.genre=any(array['mandarin','english','japanese','korean','other_language']) or exists(select 1 from public.music_categories c where c.id=new.genre)) then
      raise exception 'Unknown chart' using errcode='23514';
    end if;
  end if;
  return new;
end $$;
revoke all on function private.check_music_categories() from public,anon,authenticated;
create trigger songs_check_categories before insert or update of genres,genre on public.songs for each row execute function private.check_music_categories();
create trigger group_songs_check_categories before insert or update of genres on public.group_songs for each row execute function private.check_music_categories();
create trigger playlists_check_categories before insert or update of genre on public.playlists for each row execute function private.check_music_categories();
create trigger follows_check_categories before insert or update of genre on public.user_chart_follows for each row execute function private.check_music_categories();

alter table public.songs add column updated_at timestamptz;
alter table public.group_songs add column updated_at timestamptz;
alter table public.posts add column updated_at timestamptz;
alter table public.comments add column updated_at timestamptz;
alter table public.post_comments add column updated_at timestamptz;
alter table public.group_comments add column updated_at timestamptz;
alter table public.playlists add column updated_at timestamptz;
create function private.mark_author_edit() returns trigger language plpgsql security definer set search_path='' as $$ begin new.updated_at:=now(); return new; end $$;
revoke all on function private.mark_author_edit() from public,anon,authenticated;
create trigger songs_mark_edit before update on public.songs for each row execute function private.mark_author_edit();
create trigger group_songs_mark_edit before update on public.group_songs for each row execute function private.mark_author_edit();
create trigger posts_mark_edit before update on public.posts for each row execute function private.mark_author_edit();
create trigger comments_mark_edit before update on public.comments for each row execute function private.mark_author_edit();
create trigger post_comments_mark_edit before update on public.post_comments for each row execute function private.mark_author_edit();
create trigger group_comments_mark_edit before update on public.group_comments for each row execute function private.mark_author_edit();
create trigger playlists_mark_edit before update on public.playlists for each row execute function private.mark_author_edit();

grant update(title,artist,note,source_url,audio_path,cover_path,file_size) on public.songs to authenticated;
create policy "Authors edit own group songs" on public.group_songs for update to authenticated
  using (owner_id=(select auth.uid()) and exists(select 1 from public.music_group_members m where m.group_id=group_songs.group_id and m.user_id=(select auth.uid())))
  with check (owner_id=(select auth.uid()) and nickname=(select p.nickname from public.profiles p where p.user_id=(select auth.uid()))
    and exists(select 1 from public.music_group_members m where m.group_id=group_songs.group_id and m.user_id=(select auth.uid()))
    and (audio_path is null or split_part(audio_path,'/',1)=group_id::text and split_part(audio_path,'/',2)=owner_id::text)
    and (cover_path is null or split_part(cover_path,'/',1)=group_id::text and split_part(cover_path,'/',2)=owner_id::text));
grant update(title,artist,note,genres,language,source_url,audio_path,cover_path,file_size) on public.group_songs to authenticated;
create policy "Authors edit own posts" on public.posts for update to authenticated
  using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()) and nickname=(select p.nickname from public.profiles p where p.user_id=(select auth.uid()))
    and (image_path is null or split_part(image_path,'/',1)=(select auth.uid())::text));
grant update(title,creator,body,post_type,source_url,image_path) on public.posts to authenticated;
create policy "Authors edit own song comments" on public.comments for update to authenticated
  using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()) and nickname=(select p.nickname from public.profiles p where p.user_id=(select auth.uid()))
    and (image_path is null or split_part(image_path,'/',1)=(select auth.uid())::text));
grant update(body,image_path) on public.comments to authenticated;
create policy "Authors edit own forum replies" on public.post_comments for update to authenticated
  using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()) and nickname=(select p.nickname from public.profiles p where p.user_id=(select auth.uid()))
    and (image_path is null or split_part(image_path,'/',1)=(select auth.uid())::text));
grant update(body,image_path) on public.post_comments to authenticated;
create policy "Authors edit own group replies" on public.group_comments for update to authenticated
  using (user_id=(select auth.uid()) and exists(select 1 from public.group_songs s join public.music_group_members m on m.group_id=s.group_id
    where s.id=group_comments.song_id and m.user_id=(select auth.uid())))
  with check (user_id=(select auth.uid()) and nickname=(select p.nickname from public.profiles p where p.user_id=(select auth.uid())));
grant update(body,image_path) on public.group_comments to authenticated;
revoke update on public.playlists from authenticated;
grant update(title,description,source_url,cover_path,genre,language) on public.playlists to authenticated;

create function public.edit_playlist(p_id uuid,p_title text,p_description text,p_source_url text,p_genre text,p_language text,p_tracks jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
declare v_count integer;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if pg_catalog.jsonb_typeof(p_tracks)<>'array' then raise exception 'Add a track list'; end if;
  v_count:=pg_catalog.jsonb_array_length(p_tracks);
  if v_count not between 1 and 200 then raise exception 'A playlist needs 1–200 songs'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_id::text||':playlist_edit',0));
  update public.playlists set title=pg_catalog.btrim(p_title),description=coalesce(p_description,''),source_url=p_source_url,genre=p_genre,language=p_language
    where id=p_id and owner_id=auth.uid();
  if not found then raise exception 'Only the publisher can edit this playlist' using errcode='42501'; end if;
  delete from public.playlist_tracks where playlist_id=p_id;
  insert into public.playlist_tracks(playlist_id,position,title,artist,album,art_url)
    select p_id,n::smallint,pg_catalog.btrim(item->>'title'),coalesce(item->>'artist',''),coalesce(item->>'album',''),nullif(item->>'art_url','')
    from pg_catalog.jsonb_array_elements(p_tracks) with ordinality as t(item,n);
  return true;
end $$;
revoke all on function public.edit_playlist(uuid,text,text,text,text,text,jsonb) from public,anon;
grant execute on function public.edit_playlist(uuid,text,text,text,text,text,jsonb) to authenticated;
