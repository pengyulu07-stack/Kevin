-- Replies stay inside the song or post they belong to.
alter table public.comments add column if not exists parent_id uuid references public.comments(id) on delete set null;
alter table public.post_comments add column if not exists parent_id uuid references public.post_comments(id) on delete set null;

create or replace function private.validate_comment_parent()
returns trigger language plpgsql set search_path to '' as $function$
begin
  if new.parent_id is null then return new; end if;
  if tg_table_name = 'comments' then
    if not exists(select 1 from public.comments p where p.id = new.parent_id and p.song_id = new.song_id) then
      raise exception 'Reply must belong to the same song' using errcode = '23514';
    end if;
  elsif not exists(select 1 from public.post_comments p where p.id = new.parent_id and p.post_id = new.post_id) then
    raise exception 'Reply must belong to the same post' using errcode = '23514';
  end if;
  if new.parent_id = new.id then raise exception 'A comment cannot reply to itself' using errcode = '23514'; end if;
  return new;
end $function$;

create trigger validate_comment_parent before insert or update of parent_id,song_id on public.comments
for each row execute function private.validate_comment_parent();
create trigger validate_post_comment_parent before insert or update of parent_id,post_id on public.post_comments
for each row execute function private.validate_comment_parent();

create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id,user_id)
);
create table if not exists public.post_comment_likes (
  comment_id uuid not null references public.post_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id,user_id)
);
alter table public.comment_likes enable row level security;
alter table public.post_comment_likes enable row level security;
create policy "Read song comment likes" on public.comment_likes for select to anon,authenticated using (true);
create policy "Like a song comment" on public.comment_likes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Remove own song comment like" on public.comment_likes for delete to authenticated using (user_id = (select auth.uid()));
create policy "Read post comment likes" on public.post_comment_likes for select to anon,authenticated using (true);
create policy "Like a post comment" on public.post_comment_likes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Remove own post comment like" on public.post_comment_likes for delete to authenticated using (user_id = (select auth.uid()));
create index if not exists comments_parent_id_idx on public.comments(parent_id);
create index if not exists post_comments_parent_id_idx on public.post_comments(parent_id);
