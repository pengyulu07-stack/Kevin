-- Preserve a small, attributed gallery chosen while sharing a public song.
alter table public.songs
  add column if not exists media_gallery jsonb not null default '[]'::jsonb;

alter table public.songs
  add constraint songs_media_gallery_shape check (
    jsonb_typeof(media_gallery) = 'array'
    and jsonb_array_length(media_gallery) <= 6
  );
