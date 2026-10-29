-- Four public sharing spaces alongside the existing music collection.
-- Each signed-in identity can create three posts per category per Shanghai day.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  day date not null default ((now() at time zone 'Asia/Shanghai')::date),
  category text not null check (category in ('daily','forum','film','art')),
  post_type text not null default 'share' check (post_type in ('share','question','discussion','debate')),
  daily_slot smallint not null check (daily_slot between 1 and 3),
  title text not null check (char_length(btrim(title)) between 1 and 100),
  creator text not null default '' check (char_length(creator) <= 100),
  body text not null default '' check (char_length(body) <= 2000),
  nickname text not null check (char_length(btrim(nickname)) between 1 and 30),
  image_path text unique check (image_path is null or image_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|gif)$'),
  source_url text check (source_url is null or source_url ~ '^https://[^[:space:]]{1,2048}$'),
  created_at timestamptz not null default now(),
  constraint posts_three_per_space_per_day unique (owner_id,day,category,daily_slot),
  constraint posts_kind_matches_category check (category = 'forum' or post_type = 'share')
);
create index if not exists posts_category_day_created on public.posts(category,day,created_at desc);
create index if not exists posts_owner_id on public.posts(owner_id);
alter table public.posts enable row level security;
create policy "Everyone can read posts" on public.posts for select to anon,authenticated using (true);
create policy "Member can publish own post" on public.posts for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and day = (now() at time zone 'Asia/Shanghai')::date
    and created_at between now() - interval '1 minute' and now() + interval '1 minute'
    and nickname = (select p.nickname from public.profiles p where p.user_id = (select auth.uid()))
    and (image_path is null or split_part(image_path,'/',1) = (select auth.uid())::text)
  );
grant select on public.posts to anon,authenticated;
grant insert on public.posts to authenticated;

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null check (emoji in ('👍','👎','🐶','❤️','😭','🤮')),
  created_at timestamptz not null default now(),
  primary key (post_id,user_id)
);
create index if not exists post_reactions_user_id on public.post_reactions(user_id);
alter table public.post_reactions enable row level security;
create policy "Everyone can read post reactions" on public.post_reactions for select to anon,authenticated using (true);
create policy "Member can react to post" on public.post_reactions for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Member can change own post reaction" on public.post_reactions for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Member can remove own post reaction" on public.post_reactions for delete to authenticated
  using (user_id = (select auth.uid()));
grant select on public.post_reactions to anon,authenticated;
grant insert,update,delete on public.post_reactions to authenticated;

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 1 and 30),
  body text not null default '' check (char_length(body) <= 800),
  image_path text unique check (image_path is null or image_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|gif)$'),
  created_at timestamptz not null default now(),
  constraint post_comment_has_content check (btrim(body) <> '' or image_path is not null)
);
create index if not exists post_comments_post_created on public.post_comments(post_id,created_at);
create index if not exists post_comments_user_id on public.post_comments(user_id);
alter table public.post_comments enable row level security;
create policy "Everyone can read post comments" on public.post_comments for select to anon,authenticated using (true);
create policy "Member can comment on post" on public.post_comments for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and nickname = (select p.nickname from public.profiles p where p.user_id = (select auth.uid()))
    and (image_path is null or split_part(image_path,'/',1) = (select auth.uid())::text)
  );
grant select on public.post_comments to anon,authenticated;
grant insert on public.post_comments to authenticated;

-- Display names are bound to the account rather than trusted from browser input.
alter policy "Guests can publish one owned song" on public.songs
  with check (
    owner_id = (select auth.uid())
    and day = (now() at time zone 'Asia/Shanghai')::date
    and nickname = (select p.nickname from public.profiles p where p.user_id = (select auth.uid()))
    and (audio_path is null or split_part(audio_path,'/',1) = (select auth.uid())::text)
    and (cover_path is null or split_part(cover_path,'/',1) = (select auth.uid())::text)
  );
alter policy "Guests can add own comment" on public.comments
  with check (
    user_id = (select auth.uid())
    and nickname = (select p.nickname from public.profiles p where p.user_id = (select auth.uid()))
    and (image_path is null or split_part(image_path,'/',1) = (select auth.uid())::text)
  );
