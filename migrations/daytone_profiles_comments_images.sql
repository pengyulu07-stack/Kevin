-- Empty initial tables are expanded for the requested guest profiles and three daily picks.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 1 and 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Guests can read own profile" on public.profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Guests can create own profile" on public.profiles for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Guests can edit own profile" on public.profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
grant select, insert, update on public.profiles to authenticated;

alter table public.songs drop constraint one_song_per_person_per_day;
alter table public.songs add column daily_slot smallint not null default 1
  check (daily_slot between 1 and 3);
alter table public.songs add constraint three_songs_per_person_per_day
  unique (owner_id, day, daily_slot);
alter table public.songs add column cover_path text unique;
alter table public.songs add constraint safe_cover_path
  check (cover_path is null or cover_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|gif)$');
alter table public.songs drop constraint one_source;
alter table public.songs add constraint at_most_one_source
  check (not (audio_path is not null and source_url is not null));
alter table public.songs alter column artist set default '';

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 1 and 30),
  body text not null default '' check (char_length(body) <= 500),
  image_path text unique,
  created_at timestamptz not null default now(),
  constraint comment_has_content check (btrim(body) <> '' or image_path is not null),
  constraint safe_comment_image check
    (image_path is null or image_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|gif)$')
);
create index comments_song_created on public.comments(song_id, created_at);
create index comments_user_id on public.comments(user_id);
alter table public.comments enable row level security;
create policy "Public can read comments" on public.comments for select to anon, authenticated using (true);
create policy "Guests can add own comment" on public.comments for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Guests can remove own comment" on public.comments for delete to authenticated
  using (user_id = (select auth.uid()));
grant select on public.comments to anon, authenticated;
grant insert, delete on public.comments to authenticated;

alter table public.reactions drop constraint reactions_emoji_check;
alter table public.reactions add constraint reactions_emoji_check
  check (emoji in ('👍','👎','🐶','❤️','😭','🤮'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 1048576, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Guests can upload own images" on storage.objects for insert to authenticated
  with check (bucket_id = 'images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|gif)$');
create policy "Guests can inspect own images" on storage.objects for select to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Guests can remove own images" on storage.objects for delete to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = (select auth.uid())::text);
