-- Books use the existing public sharing, reply, reaction, and image policies.
-- Each member retains the same three-post daily limit per category.
alter table public.posts drop constraint if exists posts_category_check;
alter table public.posts add constraint posts_category_check
  check (category in ('daily','forum','film','art','books'));
