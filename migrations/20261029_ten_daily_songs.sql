alter table public.songs drop constraint songs_daily_slot_check;
alter table public.songs add constraint songs_daily_slot_check check(daily_slot between 1 and 10);
alter table public.group_songs drop constraint group_songs_daily_slot_check;
alter table public.group_songs add constraint group_songs_daily_slot_check check(daily_slot between 1 and 10);
alter table public.songs rename constraint three_songs_per_person_per_day to ten_songs_per_person_per_day;
