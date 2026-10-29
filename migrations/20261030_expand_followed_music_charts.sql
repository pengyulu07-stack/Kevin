-- A member can follow up to five music charts. Existing follows retain their slots.
alter table public.user_chart_follows drop constraint user_chart_follows_slot_check;
alter table public.user_chart_follows add constraint user_chart_follows_slot_check check (slot between 1 and 5);
