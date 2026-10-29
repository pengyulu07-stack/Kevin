-- A nickname change must not lock an author out of editing older work.
alter policy "Authors edit own group songs" on public.group_songs
  with check (owner_id=(select auth.uid()) and exists(select 1 from public.music_group_members m where m.group_id=group_songs.group_id and m.user_id=(select auth.uid()))
    and (audio_path is null or split_part(audio_path,'/',1)=group_id::text and split_part(audio_path,'/',2)=owner_id::text)
    and (cover_path is null or split_part(cover_path,'/',1)=group_id::text and split_part(cover_path,'/',2)=owner_id::text));
alter policy "Authors edit own posts" on public.posts
  with check (owner_id=(select auth.uid()) and (image_path is null or split_part(image_path,'/',1)=(select auth.uid())::text));
alter policy "Authors edit own song comments" on public.comments
  with check (user_id=(select auth.uid()) and (image_path is null or split_part(image_path,'/',1)=(select auth.uid())::text));
alter policy "Authors edit own forum replies" on public.post_comments
  with check (user_id=(select auth.uid()) and (image_path is null or split_part(image_path,'/',1)=(select auth.uid())::text));
alter policy "Authors edit own group replies" on public.group_comments
  with check (user_id=(select auth.uid()));
