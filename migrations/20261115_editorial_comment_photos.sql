-- Allow a reader to attach one photo to an editorial-work comment.
-- The existing public images bucket restricts uploads to the member's own UUID folder.
alter table public.editorial_comments add column if not exists image_path text unique;
alter table public.editorial_comments alter column body drop not null;
alter table public.editorial_comments add constraint editorial_comment_has_content
  check ((body is not null and char_length(btrim(body)) between 1 and 1000) or image_path is not null);
alter table public.editorial_comments add constraint editorial_comment_image_path
  check (image_path is null or image_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](jpg|png|webp|gif)$');
drop policy if exists "Members comment on editorial works" on public.editorial_comments;
create policy "Members comment on editorial works" on public.editorial_comments
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and nickname = (select p.nickname from public.profiles p where p.user_id = (select auth.uid()))
    and created_at between now() - interval '1 minute' and now() + interval '1 minute'
    and (image_path is null or split_part(image_path, '/', 1) = (select auth.uid())::text)
  );
