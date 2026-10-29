alter table public.songs drop constraint songs_artist_check;
alter table public.songs add constraint songs_artist_check
  check (char_length(artist) <= 100);
