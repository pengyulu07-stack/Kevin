-- PostgreSQL regular-expression repeat bounds cannot be 2048; cap length separately.
alter table public.playlists drop constraint playlists_source_url_check;
alter table public.playlists add constraint playlists_source_url_check check
 (source_url is null or (source_url ~ '^https://[^[:space:]]+$' and char_length(source_url)<=2048));
alter table public.playlist_tracks drop constraint playlist_tracks_art_url_check;
alter table public.playlist_tracks add constraint playlist_tracks_art_url_check check
 (art_url is null or (art_url ~ '^https://[^[:space:]]+$' and char_length(art_url)<=2048));
alter table public.group_songs drop constraint group_songs_source_url_check;
alter table public.group_songs add constraint group_songs_source_url_check check
 (source_url is null or (source_url ~ '^https://[^[:space:]]+$' and char_length(source_url)<=2048));
alter table public.posts drop constraint posts_source_url_check;
alter table public.posts add constraint posts_source_url_check check
 (source_url is null or (source_url ~ '^https://[^[:space:]]+$' and char_length(source_url)<=2048));
