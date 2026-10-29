-- Small, text-only activity feed. Group events inherit membership privacy.
create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('song','group_song','forum','playlist',
    'song_reply','group_reply','forum_reply','song_reaction','group_reaction','forum_reaction','top5')),
  group_id uuid references public.music_groups(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_nickname text not null default '',
  subject_owner_id uuid references auth.users(id) on delete set null,
  subject_id uuid not null,
  title text not null default '',
  emoji text,
  genres text[] not null default array[]::text[],
  language text,
  event_key text unique,
  created_at timestamptz not null default now()
);
create index activity_events_recent on public.activity_events (created_at desc);
create index activity_events_group_recent on public.activity_events (group_id,created_at desc);
alter table public.activity_events enable row level security;
create policy "Read public or joined activity" on public.activity_events for select to authenticated
 using (group_id is null or exists(select 1 from public.music_group_members m
   where m.group_id=activity_events.group_id and m.user_id=(select auth.uid())));
grant select on public.activity_events to authenticated;

create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  scope text not null default 'following' check (scope in ('all','following')),
  display text not null default 'bell' check (display in ('bell','rail','both')),
  updated_at timestamptz not null default now()
);
alter table public.notification_preferences enable row level security;
create policy "Read own notification settings" on public.notification_preferences for select to authenticated
 using (user_id=(select auth.uid()));
create policy "Create own notification settings" on public.notification_preferences for insert to authenticated
 with check (user_id=(select auth.uid()));
create policy "Update own notification settings" on public.notification_preferences for update to authenticated
 using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
grant select,insert,update on public.notification_preferences to authenticated;

create table public.notification_dismissals (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.activity_events(id) on delete cascade,
  dismissed_at timestamptz not null default now(),
  primary key(user_id,event_id)
);
alter table public.notification_dismissals enable row level security;
create policy "Read own dismissed activity" on public.notification_dismissals for select to authenticated
 using (user_id=(select auth.uid()));
create policy "Dismiss own activity" on public.notification_dismissals for insert to authenticated
 with check (user_id=(select auth.uid()));
grant select,insert on public.notification_dismissals to authenticated;

create function private.emit_daytone_activity()
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
  if v_kind='song_reaction' and v_emoji in ('👍','❤️') and v_owner<>v_actor then
    select pos into v_rank from (
      select s.id,pg_catalog.row_number() over(order by
        (select count(*) from public.reactions r where r.song_id=s.id and r.emoji in ('👍','❤️')) desc,
        s.created_at desc,s.id) as pos
      from public.songs s where s.day=v_day
    ) ranked where ranked.id=v_subject;
    if v_rank<=5 then
      insert into public.activity_events(kind,actor_id,actor_nickname,subject_owner_id,
        subject_id,title,genres,language,event_key)
      values('top5',v_actor,coalesce(v_nickname,''),v_owner,v_subject,
        v_title,coalesce(v_genres,array[]::text[]),v_language,'top5:'||v_subject::text)
      on conflict(event_key) do nothing;
    end if;
  end if;
  return new;
end $$;
revoke all on function private.emit_daytone_activity() from public,anon,authenticated;
create trigger activity_song after insert on public.songs for each row execute function private.emit_daytone_activity();
create trigger activity_group_song after insert on public.group_songs for each row execute function private.emit_daytone_activity();
create trigger activity_forum after insert on public.posts for each row execute function private.emit_daytone_activity();
create trigger activity_playlist after insert on public.playlists for each row execute function private.emit_daytone_activity();
create trigger activity_song_reply after insert on public.comments for each row execute function private.emit_daytone_activity();
create trigger activity_group_reply after insert on public.group_comments for each row execute function private.emit_daytone_activity();
create trigger activity_forum_reply after insert on public.post_comments for each row execute function private.emit_daytone_activity();
create trigger activity_song_reaction after insert or update of emoji on public.reactions for each row execute function private.emit_daytone_activity();
create trigger activity_group_reaction after insert or update of emoji on public.group_reactions for each row execute function private.emit_daytone_activity();
create trigger activity_forum_reaction after insert or update of emoji on public.post_reactions for each row execute function private.emit_daytone_activity();
