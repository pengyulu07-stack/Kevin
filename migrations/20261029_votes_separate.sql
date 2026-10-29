-- Music chart votes are independent of the six expressive reactions.
create table public.song_votes (
  song_id uuid not null references public.songs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (song_id,user_id)
);
create index song_votes_user_id on public.song_votes(user_id);
alter table public.song_votes enable row level security;
create policy "Anyone reads public song votes" on public.song_votes for select to anon,authenticated using (true);
create policy "Users add own public vote" on public.song_votes for insert to authenticated with check (user_id=(select auth.uid()));
create policy "Users remove own public vote" on public.song_votes for delete to authenticated using (user_id=(select auth.uid()));
grant select on public.song_votes to anon,authenticated;
grant insert,delete on public.song_votes to authenticated;

create table public.group_song_votes (
  song_id uuid not null references public.group_songs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (song_id,user_id)
);
create index group_song_votes_user_id on public.group_song_votes(user_id);
alter table public.group_song_votes enable row level security;
create policy "Members read group votes" on public.group_song_votes for select to authenticated
  using (exists(select 1 from public.group_songs s join public.music_group_members m on m.group_id=s.group_id
    where s.id=group_song_votes.song_id and m.user_id=(select auth.uid())));
create policy "Members add own group vote" on public.group_song_votes for insert to authenticated
  with check (user_id=(select auth.uid()) and exists(select 1 from public.group_songs s
    join public.music_group_members m on m.group_id=s.group_id
    where s.id=group_song_votes.song_id and m.user_id=(select auth.uid())));
create policy "Members remove own group vote" on public.group_song_votes for delete to authenticated
  using (user_id=(select auth.uid()) and exists(select 1 from public.group_songs s
    join public.music_group_members m on m.group_id=s.group_id
    where s.id=group_song_votes.song_id and m.user_id=(select auth.uid())));
grant select,insert,delete on public.group_song_votes to authenticated;

-- Preserve existing support at launch, once. Later emoji taps do not alter the chart.
insert into public.song_votes(song_id,user_id,created_at)
select song_id,user_id,created_at from public.reactions where emoji in ('👍','❤️') on conflict do nothing;
insert into public.group_song_votes(song_id,user_id,created_at)
select song_id,user_id,created_at from public.group_reactions where emoji in ('👍','❤️') on conflict do nothing;

create or replace function public.music_alltime_top(p_genre text default null)
returns table(song jsonb,supporters bigint) language sql stable security invoker set search_path='' as $$
  select to_jsonb(s), (select count(*) from public.song_votes v where v.song_id=s.id)
  from public.songs s
  where p_genre is null or p_genre=any(s.genres) or p_genre=s.language
  order by 2 desc,s.created_at desc,s.id
  limit 5
$$;
create or replace function public.group_music_alltime_top(p_group_id uuid)
returns table(song jsonb,supporters bigint) language sql stable security invoker set search_path='' as $$
  select to_jsonb(s), (select count(*) from public.group_song_votes v where v.song_id=s.id)
  from public.group_songs s where s.group_id=p_group_id
  order by 2 desc,s.created_at desc,s.id
  limit 5
$$;

alter table public.activity_events drop constraint activity_events_kind_check;
alter table public.activity_events add constraint activity_events_kind_check check (kind in
 ('song','group_song','forum','playlist','song_reply','group_reply','forum_reply',
  'song_reaction','group_reaction','forum_reaction','song_vote','group_vote','top5'));

create or replace function private.emit_daytone_activity()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_kind text; v_group uuid; v_actor uuid; v_nickname text;
  v_owner uuid; v_subject uuid; v_title text; v_emoji text;
  v_genres text[]:=array[]::text[]; v_language text;
  v_day date; v_rank integer;
begin
  if TG_TABLE_NAME='songs' then
    v_kind:='song';v_actor:=new.owner_id;v_nickname:=new.nickname;
    v_owner:=new.owner_id;v_subject:=new.id;v_title:=new.title;
    v_genres:=new.genres;v_language:=new.language;
  elsif TG_TABLE_NAME='group_songs' then
    v_kind:='group_song';v_group:=new.group_id;v_actor:=new.owner_id;
    v_nickname:=new.nickname;v_owner:=new.owner_id;v_subject:=new.id;
    v_title:=new.title;v_genres:=new.genres;v_language:=new.language;
  elsif TG_TABLE_NAME='posts' then
    if new.category<>'forum' then return new; end if;
    v_kind:='forum';v_actor:=new.owner_id;v_nickname:=new.nickname;
    v_owner:=new.owner_id;v_subject:=new.id;v_title:=new.title;
  elsif TG_TABLE_NAME='playlists' then
    v_kind:='playlist';v_group:=new.group_id;v_actor:=new.owner_id;
    v_nickname:=new.nickname;v_owner:=new.owner_id;v_subject:=new.id;
    v_title:=new.title;v_genres:=array[new.genre];v_language:=new.language;
  elsif TG_TABLE_NAME='comments' then
    select s.owner_id,s.title,s.genres,s.language into v_owner,v_title,v_genres,v_language
    from public.songs s where s.id=new.song_id;
    v_kind:='song_reply';v_actor:=new.user_id;v_nickname:=new.nickname;v_subject:=new.song_id;
  elsif TG_TABLE_NAME='group_comments' then
    select s.owner_id,s.title,s.group_id,s.genres,s.language
      into v_owner,v_title,v_group,v_genres,v_language
    from public.group_songs s where s.id=new.song_id;
    v_kind:='group_reply';v_actor:=new.user_id;v_nickname:=new.nickname;v_subject:=new.song_id;
  elsif TG_TABLE_NAME='post_comments' then
    select p.owner_id,p.title into v_owner,v_title from public.posts p where p.id=new.post_id;
    v_kind:='forum_reply';v_actor:=new.user_id;v_nickname:=new.nickname;v_subject:=new.post_id;
  elsif TG_TABLE_NAME='reactions' then
    select s.owner_id,s.title,s.genres,s.language,s.day
      into v_owner,v_title,v_genres,v_language,v_day
    from public.songs s where s.id=new.song_id;
    v_kind:='song_reaction';v_actor:=new.user_id;v_subject:=new.song_id;v_emoji:=new.emoji;
  elsif TG_TABLE_NAME='group_reactions' then
    select s.owner_id,s.title,s.group_id,s.genres,s.language
      into v_owner,v_title,v_group,v_genres,v_language
    from public.group_songs s where s.id=new.song_id;
    v_kind:='group_reaction';v_actor:=new.user_id;v_subject:=new.song_id;v_emoji:=new.emoji;
  elsif TG_TABLE_NAME='post_reactions' then
    select p.owner_id,p.title into v_owner,v_title from public.posts p where p.id=new.post_id;
    v_kind:='forum_reaction';v_actor:=new.user_id;v_subject:=new.post_id;v_emoji:=new.emoji;
  else return new; end if;
  if v_subject is null then return new; end if;
  if v_nickname is null then
    select p.nickname into v_nickname from public.profiles p where p.user_id=v_actor;
  end if;
  insert into public.activity_events(kind,group_id,actor_id,actor_nickname,
    subject_owner_id,subject_id,title,emoji,genres,language)
  values(v_kind,v_group,v_actor,coalesce(v_nickname,''),v_owner,v_subject,
    coalesce(v_title,''),v_emoji,coalesce(v_genres,array[]::text[]),v_language);
  return new;
end $$;

create function private.emit_daytone_vote_activity()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_kind text; v_group uuid; v_owner uuid; v_title text; v_genres text[];
  v_language text; v_day date; v_nickname text; v_rank integer;
begin
  if TG_TABLE_NAME='song_votes' then
    select owner_id,title,genres,language,day into v_owner,v_title,v_genres,v_language,v_day
    from public.songs where id=new.song_id;
    v_kind:='song_vote';
  else
    select owner_id,title,group_id,genres,language,day
      into v_owner,v_title,v_group,v_genres,v_language,v_day
    from public.group_songs where id=new.song_id;
    v_kind:='group_vote';
  end if;
  if v_owner is null then return new; end if;
  select nickname into v_nickname from public.profiles where user_id=new.user_id;
  insert into public.activity_events(kind,group_id,actor_id,actor_nickname,
    subject_owner_id,subject_id,title,genres,language)
  values(v_kind,v_group,new.user_id,coalesce(v_nickname,''),v_owner,new.song_id,
    coalesce(v_title,''),coalesce(v_genres,array[]::text[]),v_language);
  if v_kind='song_vote' and v_owner<>new.user_id then
    select pos into v_rank from (
      select s.id,pg_catalog.row_number() over(order by
        (select count(*) from public.song_votes v where v.song_id=s.id) desc,
        s.created_at desc,s.id) as pos
      from public.songs s where s.day=v_day
    ) ranked where ranked.id=new.song_id;
    if v_rank<=5 then
      insert into public.activity_events(kind,actor_id,actor_nickname,subject_owner_id,
        subject_id,title,genres,language,event_key)
      values('top5',new.user_id,coalesce(v_nickname,''),v_owner,new.song_id,
        v_title,coalesce(v_genres,array[]::text[]),v_language,'top5:'||new.song_id::text)
      on conflict(event_key) do nothing;
    end if;
  end if;
  return new;
end $$;
revoke all on function private.emit_daytone_vote_activity() from public,anon,authenticated;
create trigger activity_song_vote after insert on public.song_votes
  for each row execute function private.emit_daytone_vote_activity();
create trigger activity_group_vote after insert on public.group_song_votes
  for each row execute function private.emit_daytone_vote_activity();
