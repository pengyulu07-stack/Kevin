create table if not exists public.user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  constraint cannot_follow_self check (follower_id <> followed_id)
);
create index if not exists user_follows_followed_idx on public.user_follows(followed_id);
alter table public.user_follows enable row level security;
create policy "Anyone can see follows" on public.user_follows for select to anon,authenticated using (true);
create policy "Follow another member" on public.user_follows for insert to authenticated with check (follower_id = (select auth.uid()) and follower_id <> followed_id);
create policy "Unfollow a member" on public.user_follows for delete to authenticated using (follower_id = (select auth.uid()));
