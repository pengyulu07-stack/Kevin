-- Keep the identified album and an independently chosen on-site video beside the original music link.
alter table public.songs
  add column if not exists album text not null default '' check (char_length(album) <= 120),
  add column if not exists video_url text check (video_url is null or video_url ~ '^https://[^[:space:]]{1,2048}$');
