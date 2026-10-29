-- A song may appear in up to three overlapping discovery charts.
alter table public.songs drop constraint songs_genre_check;
alter table public.songs add constraint songs_genre_check check (genre in
  ('pop','rock','hiphop','electronic','rnb','jazz','classical','soundtrack','indie','chinese','instrumental','folk','kpop','other'));
alter table public.songs add column genres text[] not null default array['other']::text[];
alter table public.songs add constraint songs_genres_check check (
  cardinality(genres) between 1 and 3 and genres <@ array[
    'pop','rock','hiphop','electronic','rnb','jazz','classical','soundtrack','indie','chinese','instrumental','folk','kpop','other']::text[]);
update public.songs set genres=array[genre] where genres=array['other']::text[] and genre<>'other';
grant update(genre,genres) on public.songs to authenticated;
alter table public.user_chart_follows drop constraint user_chart_follows_genre_check;
alter table public.user_chart_follows add constraint user_chart_follows_genre_check check (genre in
  ('pop','rock','hiphop','electronic','rnb','jazz','classical','soundtrack','indie','chinese','instrumental','folk','kpop','other'));
