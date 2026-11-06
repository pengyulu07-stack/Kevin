-- Admin desk for public content. Seed the owner's auth user ID separately.
-- The browser uses the ordinary publishable key; these policies enforce access.
create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.site_admins enable row level security;
create policy "Admins see own membership" on public.site_admins for select to authenticated
  using (user_id = (select auth.uid()));
grant select on public.site_admins to authenticated;

create policy "Admins edit public songs" on public.songs for update to authenticated
  using (exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())));
create policy "Admins edit public forums" on public.posts for update to authenticated
  using (exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())));
create policy "Admins edit public song replies" on public.comments for update to authenticated
  using (exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())));
create policy "Admins edit public forum replies" on public.post_comments for update to authenticated
  using (exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())));
create policy "Admins edit public playlists" on public.playlists for update to authenticated
  using (group_id is null and exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())))
  with check (group_id is null and exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())));
create policy "Admins read feedback" on public.feedback for select to authenticated
  using (exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())));
grant update(title,artist,note,cover_path,source_url) on public.songs to authenticated;
grant update(title,body,image_path,source_url) on public.posts to authenticated;
grant update(body,image_path) on public.comments,public.post_comments to authenticated;
grant update(title,description,cover_path,source_url) on public.playlists to authenticated;

create table if not exists public.moderation_history (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  item_type text not null check (item_type in ('songs','posts','comments','post_comments','playlists')),
  item_id uuid not null,
  previous_data jsonb not null,
  revised_data jsonb not null,
  changed_at timestamptz not null default now()
);
create index if not exists moderation_history_changed_at on public.moderation_history(changed_at desc);
alter table public.moderation_history enable row level security;
create policy "Admins read moderation history" on public.moderation_history for select to authenticated
  using (exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())));
grant select on public.moderation_history to authenticated;

create or replace function private.log_admin_edit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.site_admins a where a.user_id = auth.uid()) then
    insert into public.moderation_history(actor_id,item_type,item_id,previous_data,revised_data)
    values (auth.uid(),tg_table_name,new.id,to_jsonb(old),to_jsonb(new));
  end if;
  return new;
end;
$$;
revoke all on function private.log_admin_edit() from public,anon,authenticated;
create trigger admin_edit_songs after update on public.songs for each row execute function private.log_admin_edit();
create trigger admin_edit_posts after update on public.posts for each row execute function private.log_admin_edit();
create trigger admin_edit_comments after update on public.comments for each row execute function private.log_admin_edit();
create trigger admin_edit_post_comments after update on public.post_comments for each row execute function private.log_admin_edit();
create trigger admin_edit_playlists after update on public.playlists for each row execute function private.log_admin_edit();
