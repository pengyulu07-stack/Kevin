alter policy "Update own playlist" on public.playlists
  with check (owner_id=(select auth.uid()) and
    (group_id is null or exists(select 1 from public.music_group_members m
      where m.group_id=playlists.group_id and m.user_id=(select auth.uid()))) and
    (cover_path is null or split_part(cover_path,'/',1)=owner_id::text and
      split_part(cover_path,'/',2)=id::text));
