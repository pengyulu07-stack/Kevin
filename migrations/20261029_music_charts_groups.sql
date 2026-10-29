-- Public genre charts, two followed charts, private music circles, and calendar feedback.
-- The existing public songs stay public; private group content has separate tables and storage.

alter table public.songs add column if not exists genre text not null default 'other';
alter table public.songs drop constraint if exists songs_genre_check;
alter table public.songs add constraint songs_genre_check check (genre in
  ('pop','rock','hiphop','electronic','rnb','jazz','classical','soundtrack','indie','other'));
create index if not exists songs_day_genre_created on public.songs(day,genre,created_at desc);
create policy "Authors can recategorize own songs" on public.songs for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
grant update(genre) on public.songs to authenticated;

create table public.user_chart_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  slot smallint not null check (slot between 1 and 2),
  genre text not null check (genre in
    ('pop','rock','hiphop','electronic','rnb','jazz','classical','soundtrack','indie','other')),
  created_at timestamptz not null default now(),
  primary key (user_id,slot), unique (user_id,genre)
);
alter table public.user_chart_follows enable row level security;
create policy "Read own followed charts" on public.user_chart_follows for select to authenticated using (user_id = (select auth.uid()));
create policy "Follow chart in own slot" on public.user_chart_follows for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Unfollow own chart" on public.user_chart_follows for delete to authenticated using (user_id = (select auth.uid()));
grant select,insert,delete on public.user_chart_follows to authenticated;

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default ((now() at time zone 'Asia/Shanghai')::date),
  daily_slot smallint not null check (daily_slot between 1 and 3),
  message text not null check (char_length(btrim(message)) between 3 and 1000),
  created_at timestamptz not null default now(),
  unique (user_id,day,daily_slot)
);
alter table public.feedback enable row level security;
create policy "Read own feedback" on public.feedback for select to authenticated using (user_id = (select auth.uid()));
create policy "Send own feedback" on public.feedback for insert to authenticated
  with check (user_id = (select auth.uid()) and day = (now() at time zone 'Asia/Shanghai')::date);
grant select,insert on public.feedback to authenticated;

create schema if not exists private;
revoke all on schema private from public,anon,authenticated;

create table public.music_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  code text not null unique check (code ~ '^[A-F0-9]{16}$'),
  theme_index smallint not null check (theme_index between 0 and 5),
  font_index smallint not null check (font_index between 0 and 2),
  room_path text,
  top1_path text,
  top2_path text,
  top3_path text,
  created_at timestamptz not null default now()
);
create index music_groups_owner_id on public.music_groups(owner_id);
alter table public.music_groups enable row level security;

create table public.music_group_members (
  group_id uuid not null references public.music_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key(group_id,user_id)
);
create index music_group_members_user_id on public.music_group_members(user_id,group_id);
alter table public.music_group_members enable row level security;
create policy "Read own group memberships" on public.music_group_members for select to authenticated
  using (user_id = (select auth.uid()));
grant select on public.music_group_members to authenticated;
create policy "Read joined music groups" on public.music_groups for select to authenticated
  using (exists(select 1 from public.music_group_members m where m.group_id = id and m.user_id = (select auth.uid())));
grant select on public.music_groups to authenticated;

create table private.music_group_passwords (
  group_id uuid primary key references public.music_groups(id) on delete cascade,
  password_hash text not null
);
create table private.music_group_join_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_start timestamptz not null default now(),
  attempts integer not null default 0
);

create function public.create_music_group(p_name text,p_password text)
returns table(group_id uuid,group_code text)
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_code text; v_theme smallint; v_font smallint;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if char_length(btrim(p_name)) not between 1 and 60 then raise exception 'Group name must be 1–60 characters'; end if;
  if char_length(p_password) not between 8 and 72 then raise exception 'Password must be 8–72 characters'; end if;
  if (select count(*) from public.music_groups g where g.owner_id = auth.uid()) >= 3 then
    raise exception 'You can create up to three private groups';
  end if;
  v_code := upper(encode(extensions.gen_random_bytes(8),'hex'));
  v_theme := (get_byte(extensions.gen_random_bytes(1),0) % 6)::smallint;
  v_font := (get_byte(extensions.gen_random_bytes(1),0) % 3)::smallint;
  insert into public.music_groups(owner_id,name,code,theme_index,font_index)
    values(auth.uid(),btrim(p_name),v_code,v_theme,v_font) returning id into v_id;
  insert into private.music_group_passwords(group_id,password_hash)
    values(v_id,extensions.crypt(p_password,extensions.gen_salt('bf',10)));
  insert into public.music_group_members(group_id,user_id) values(v_id,auth.uid());
  return query select v_id,v_code;
end $$;
revoke all on function public.create_music_group(text,text) from public,anon;
grant execute on function public.create_music_group(text,text) to authenticated;

create function public.join_music_group(p_code text,p_password text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_hash text; v_attempts integer;
begin
  if auth.uid() is null then return null; end if;
  insert into private.music_group_join_limits(user_id,window_start,attempts)
    values(auth.uid(),now(),1)
    on conflict(user_id) do update set
      window_start = case when private.music_group_join_limits.window_start < now()-interval '15 minutes' then now() else private.music_group_join_limits.window_start end,
      attempts = case when private.music_group_join_limits.window_start < now()-interval '15 minutes' then 1 else private.music_group_join_limits.attempts+1 end
    returning attempts into v_attempts;
  if v_attempts > 12 then return null; end if;
  select g.id,s.password_hash into v_id,v_hash from public.music_groups g
    join private.music_group_passwords s on s.group_id=g.id
    where g.code = upper(btrim(p_code));
  if v_id is null or v_hash is null or extensions.crypt(p_password,v_hash) <> v_hash then return null; end if;
  insert into public.music_group_members(group_id,user_id) values(v_id,auth.uid()) on conflict do nothing;
  return v_id;
end $$;
revoke all on function public.join_music_group(text,text) from public,anon;
grant execute on function public.join_music_group(text,text) to authenticated;

create table public.group_songs (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.music_groups(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  day date not null default ((now() at time zone 'Asia/Shanghai')::date),
  daily_slot smallint not null check (daily_slot between 1 and 3),
  title text not null check (char_length(btrim(title)) between 1 and 100),
  artist text not null default '' check (char_length(artist) <= 100),
  nickname text not null check (char_length(btrim(nickname)) between 1 and 30),
  note text not null default '' check (char_length(note) <= 500),
  audio_path text unique,
  source_url text check (source_url is null or source_url ~ '^https://[^[:space:]]{1,2048}$'),
  cover_path text unique,
  file_size integer check (file_size is null or file_size between 1 and 8388608),
  created_at timestamptz not null default now(),
  unique(group_id,owner_id,day,daily_slot),
  constraint group_song_audio_path check (audio_path is null or audio_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(mp3|m4a|ogg|wav|webm)$'),
  constraint group_song_cover_path check (cover_path is null or cover_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|gif)$')
);
create index group_songs_group_day_created on public.group_songs(group_id,day,created_at desc);
alter table public.group_songs enable row level security;
create policy "Members read group songs" on public.group_songs for select to authenticated
  using (exists(select 1 from public.music_group_members m where m.group_id=group_songs.group_id and m.user_id=(select auth.uid())));
create policy "Members publish own group songs" on public.group_songs for insert to authenticated
  with check (owner_id=(select auth.uid()) and day=(now() at time zone 'Asia/Shanghai')::date
    and nickname=(select p.nickname from public.profiles p where p.user_id=(select auth.uid()))
    and exists(select 1 from public.music_group_members m where m.group_id=group_songs.group_id and m.user_id=(select auth.uid()))
    and (audio_path is null or split_part(audio_path,'/',1)=group_id::text and split_part(audio_path,'/',2)=owner_id::text)
    and (cover_path is null or split_part(cover_path,'/',1)=group_id::text and split_part(cover_path,'/',2)=owner_id::text));
grant select,insert on public.group_songs to authenticated;

create table public.group_reactions (
  song_id uuid not null references public.group_songs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null check (emoji in ('👍','👎','🐶','❤️','😭','🤮')),
  created_at timestamptz not null default now(),
  primary key(song_id,user_id)
);
alter table public.group_reactions enable row level security;
create policy "Members read group reactions" on public.group_reactions for select to authenticated
  using (exists(select 1 from public.group_songs s join public.music_group_members m on m.group_id=s.group_id
    where s.id=group_reactions.song_id and m.user_id=(select auth.uid())));
create policy "Members add own group reaction" on public.group_reactions for insert to authenticated
  with check (user_id=(select auth.uid()) and exists(select 1 from public.group_songs s
    join public.music_group_members m on m.group_id=s.group_id
    where s.id=group_reactions.song_id and m.user_id=(select auth.uid())));
create policy "Members change own group reaction" on public.group_reactions for update to authenticated
  using (user_id=(select auth.uid()) and exists(select 1 from public.group_songs s
    join public.music_group_members m on m.group_id=s.group_id
    where s.id=group_reactions.song_id and m.user_id=(select auth.uid())))
  with check (user_id=(select auth.uid()) and exists(select 1 from public.group_songs s
    join public.music_group_members m on m.group_id=s.group_id
    where s.id=group_reactions.song_id and m.user_id=(select auth.uid())));
create policy "Members remove own group reaction" on public.group_reactions for delete to authenticated
  using (user_id=(select auth.uid()) and exists(select 1 from public.group_songs s
    join public.music_group_members m on m.group_id=s.group_id
    where s.id=group_reactions.song_id and m.user_id=(select auth.uid())));
grant select,insert,update,delete on public.group_reactions to authenticated;

create table public.group_comments (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.group_songs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 1 and 30),
  body text not null default '' check (char_length(body) <= 500),
  image_path text unique,
  created_at timestamptz not null default now(),
  check (btrim(body)<>'' or image_path is not null),
  check (image_path is null or image_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|gif)$')
);
create index group_comments_song_created on public.group_comments(song_id,created_at);
alter table public.group_comments enable row level security;
create policy "Members read group comments" on public.group_comments for select to authenticated
  using (exists(select 1 from public.group_songs s join public.music_group_members m on m.group_id=s.group_id
    where s.id=group_comments.song_id and m.user_id=(select auth.uid())));
create policy "Members add own group comment" on public.group_comments for insert to authenticated
  with check (user_id=(select auth.uid())
    and nickname=(select p.nickname from public.profiles p where p.user_id=(select auth.uid()))
    and exists(select 1 from public.group_songs s join public.music_group_members m on m.group_id=s.group_id
      where s.id=group_comments.song_id and m.user_id=(select auth.uid())
      and (image_path is null or split_part(image_path,'/',1)=s.group_id::text and split_part(image_path,'/',2)=user_id::text)));
grant select,insert on public.group_comments to authenticated;

create table public.group_artwork_submissions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.music_groups(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  slot text not null check (slot in ('room','top1','top2','top3')),
  image_path text not null unique check (image_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|gif)$'),
  created_at timestamptz not null default now()
);
create index group_artwork_group_slot on public.group_artwork_submissions(group_id,slot,created_at desc);
alter table public.group_artwork_submissions enable row level security;
create policy "Members read artwork ideas" on public.group_artwork_submissions for select to authenticated
  using (exists(select 1 from public.music_group_members m where m.group_id=group_artwork_submissions.group_id and m.user_id=(select auth.uid())));
create policy "Members submit own artwork" on public.group_artwork_submissions for insert to authenticated
  with check (owner_id=(select auth.uid())
    and split_part(image_path,'/',1)=group_id::text and split_part(image_path,'/',2)=owner_id::text
    and exists(select 1 from public.music_group_members m where m.group_id=group_artwork_submissions.group_id and m.user_id=(select auth.uid())));
grant select,insert on public.group_artwork_submissions to authenticated;

create function public.select_music_group_art(p_group_id uuid,p_slot text,p_submission_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_path text;
begin
  if auth.uid() is null or p_slot not in ('room','top1','top2','top3') then return false; end if;
  if not exists(select 1 from public.music_groups g where g.id=p_group_id and g.owner_id=auth.uid()) then return false; end if;
  select image_path into v_path from public.group_artwork_submissions
    where id=p_submission_id and group_id=p_group_id and slot=p_slot;
  if v_path is null then return false; end if;
  if p_slot='room' then update public.music_groups set room_path=v_path where id=p_group_id;
  elsif p_slot='top1' then update public.music_groups set top1_path=v_path where id=p_group_id;
  elsif p_slot='top2' then update public.music_groups set top2_path=v_path where id=p_group_id;
  else update public.music_groups set top3_path=v_path where id=p_group_id; end if;
  return true;
end $$;
revoke all on function public.select_music_group_art(uuid,text,uuid) from public,anon;
grant execute on function public.select_music_group_art(uuid,text,uuid) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('group-media','group-media',false,8388608,
  array['audio/mpeg','audio/mp4','audio/x-m4a','audio/ogg','audio/wav','audio/x-wav','audio/webm','image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "Members download group media" on storage.objects for select to authenticated
  using (bucket_id='group-media' and exists(
    select 1 from public.music_group_members m where m.group_id::text=(storage.foldername(name))[1] and m.user_id=(select auth.uid())));
create policy "Members upload own group media" on storage.objects for insert to authenticated
  with check (bucket_id='group-media' and (storage.foldername(name))[2]=(select auth.uid())::text
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(mp3|m4a|ogg|wav|webm|jpg|png|webp|gif)$'
    and exists(select 1 from public.music_group_members m where m.group_id::text=(storage.foldername(name))[1] and m.user_id=(select auth.uid())));
create policy "Members remove own group media" on storage.objects for delete to authenticated
  using (bucket_id='group-media' and (storage.foldername(name))[2]=(select auth.uid())::text);
