-- Run once in a new Supabase project. Never put a service_role key in browser code.
create extension if not exists pgcrypto;

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  title text not null check (char_length(title) between 1 and 100),
  artist text not null check (char_length(artist) between 1 and 100),
  nickname text not null check (char_length(nickname) between 1 and 30),
  note text not null default '' check (char_length(note) <= 500),
  audio_path text unique,
  source_url text,
  file_size integer check (file_size is null or file_size between 1 and 8388608),
  created_at timestamptz not null default now(),
  constraint one_song_per_person_per_day unique (owner_id, day),
  constraint one_source check ((audio_path is not null) <> (source_url is not null)),
  constraint safe_audio_path check (audio_path is null or audio_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(mp3|m4a|ogg|wav|webm)$'),
  constraint https_music_link check (source_url is null or source_url ~ '^https://[^ ]+$')
);
create index if not exists songs_day_created on public.songs(day, created_at desc);
alter table public.songs enable row level security;
create policy "Public can read songs" on public.songs for select to anon, authenticated using (true);
create policy "Guests can publish one owned song" on public.songs for insert to authenticated
  with check (owner_id = (select auth.uid())
    and day = (now() at time zone 'Asia/Shanghai')::date
    and (audio_path is null or split_part(audio_path, '/', 1) = (select auth.uid())::text));
grant select on public.songs to anon, authenticated;
grant insert on public.songs to authenticated;

create table if not exists public.reactions (
  song_id uuid not null references public.songs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null check (emoji in ('❤️','🔥','😌','🥲','💃','🤯')),
  created_at timestamptz not null default now(),
  primary key (song_id, user_id)
);
create index if not exists reactions_song on public.reactions(song_id);
create index if not exists reactions_user_id on public.reactions(user_id);
alter table public.reactions enable row level security;
create policy "Public can read reactions" on public.reactions for select to anon, authenticated using (true);
create policy "Guests can add own reaction" on public.reactions for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Guests can change own reaction" on public.reactions for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Guests can remove own reaction" on public.reactions for delete to authenticated using (user_id = (select auth.uid()));
grant select on public.reactions to anon, authenticated;
grant insert, update, delete on public.reactions to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tracks', 'tracks', true, 8388608, array['audio/mpeg','audio/mp4','audio/x-m4a','audio/ogg','audio/wav','audio/x-wav','audio/webm'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Guests can upload own audio" on storage.objects for insert to authenticated
  with check (bucket_id = 'tracks'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(mp3|m4a|ogg|wav|webm)$');
create policy "Guests can see own audio objects" on storage.objects for select to authenticated
  using (bucket_id = 'tracks' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Guests can remove own audio" on storage.objects for delete to authenticated
  using (bucket_id = 'tracks' and (storage.foldername(name))[1] = (select auth.uid())::text);
