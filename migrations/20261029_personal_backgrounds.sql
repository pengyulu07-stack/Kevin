create table public.user_appearance (
 user_id uuid primary key references auth.users(id) on delete cascade,
 background_mode text not null default 'system' check (background_mode in ('system','selected','custom')),
 background_id text not null default 'taxi-0' check(char_length(background_id)<=40),
 menu_side text not null default 'auto' check(menu_side in ('auto','left','right')),
 menu_layout text not null default 'auto' check(menu_layout in ('auto','stack','grid')),
 custom_path text check(custom_path is null or custom_path=user_id::text||'/background'),
 updated_at timestamptz not null default now()
);
alter table public.user_appearance enable row level security;
create policy "Read own appearance" on public.user_appearance for select to authenticated using(user_id=(select auth.uid()));
create policy "Insert own appearance" on public.user_appearance for insert to authenticated with check(user_id=(select auth.uid()));
create policy "Update own appearance" on public.user_appearance for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
grant select,insert,update on public.user_appearance to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('personal-backgrounds','personal-backgrounds',false,1048576,array['image/jpeg','image/png','image/webp']);
create policy "Read own personal background" on storage.objects for select to authenticated using(bucket_id='personal-backgrounds' and name=(select auth.uid())::text||'/background');
create policy "Upload own personal background" on storage.objects for insert to authenticated with check(bucket_id='personal-backgrounds' and name=(select auth.uid())::text||'/background');
create policy "Replace own personal background" on storage.objects for update to authenticated using(bucket_id='personal-backgrounds' and name=(select auth.uid())::text||'/background') with check(bucket_id='personal-backgrounds' and name=(select auth.uid())::text||'/background');
