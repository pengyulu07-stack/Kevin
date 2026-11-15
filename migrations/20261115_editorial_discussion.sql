-- Editorial card reactions and comments. Works are identified by room and source URL.
create table if not exists public.editorial_likes (
  work_key text not null check (char_length(work_key) between 12 and 600),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (work_key, user_id)
);
create table if not exists public.editorial_comments (
  id uuid primary key default gen_random_uuid(),
  work_key text not null check (char_length(work_key) between 12 and 600),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 30),
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists editorial_comments_work_created_idx on public.editorial_comments (work_key, created_at desc);
alter table public.editorial_likes enable row level security;
alter table public.editorial_comments enable row level security;
grant select on public.editorial_likes, public.editorial_comments to anon, authenticated;
grant insert, delete on public.editorial_likes, public.editorial_comments to authenticated;
create policy "Everyone reads editorial likes" on public.editorial_likes for select to anon, authenticated using (true);
create policy "Members like editorial works" on public.editorial_likes for insert to authenticated with check (user_id=(select auth.uid()) and created_at between now()-interval '1 minute' and now()+interval '1 minute');
create policy "Members unlike own editorial likes" on public.editorial_likes for delete to authenticated using (user_id=(select auth.uid()));
create policy "Everyone reads editorial comments" on public.editorial_comments for select to anon, authenticated using (true);
create policy "Members comment on editorial works" on public.editorial_comments for insert to authenticated with check (user_id=(select auth.uid()) and nickname=(select p.nickname from public.profiles p where p.user_id=(select auth.uid())) and created_at between now()-interval '1 minute' and now()+interval '1 minute');
create policy "Members remove own editorial comments" on public.editorial_comments for delete to authenticated using (user_id=(select auth.uid()));
