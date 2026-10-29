create index if not exists reactions_user_id on public.reactions(user_id);

alter policy "Guests can publish one owned song" on public.songs
  with check (owner_id = (select auth.uid())
    and day = (now() at time zone 'Asia/Shanghai')::date
    and (audio_path is null or split_part(audio_path, '/', 1) = (select auth.uid())::text));

alter policy "Guests can add own reaction" on public.reactions
  with check (user_id = (select auth.uid()));

alter policy "Guests can change own reaction" on public.reactions
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter policy "Guests can remove own reaction" on public.reactions
  using (user_id = (select auth.uid()));

alter policy "Guests can see own audio objects" on storage.objects
  using (bucket_id = 'tracks' and (storage.foldername(name))[1] = (select auth.uid())::text);

alter policy "Guests can remove own audio" on storage.objects
  using (bucket_id = 'tracks' and (storage.foldername(name))[1] = (select auth.uid())::text);
