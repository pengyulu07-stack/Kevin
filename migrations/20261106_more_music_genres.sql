create or replace function private.check_music_categories()
returns trigger language plpgsql security definer set search_path to ''
as $function$
declare
  v_key text;
  v_known text[]:=array[
    'pop','rock','hiphop','electronic','rnb','jazz','classical','soundtrack','indie',
    'chinese','instrumental','folk','kpop','other','alternative','punk','metal','jpop',
    'citypop','dance','funk','ambient','blues','piano','acoustic','singer_songwriter',
    'country','opera','anime','latin','afrobeats','reggae','experimental','gospel','trap','house','techno','dubstep','edm','lofi',
    'mandopop','cantopop','newage'
  ];
begin
  if TG_TABLE_NAME in ('songs','group_songs') then
    if cardinality(new.genres) not between 1 and 3 then raise exception 'Choose one to three categories' using errcode='23514'; end if;
    if (select count(distinct x) from unnest(new.genres) as x)<>cardinality(new.genres) then raise exception 'Duplicate categories are not allowed' using errcode='23514'; end if;
    foreach v_key in array new.genres loop
      if not (v_key=any(v_known) or exists(select 1 from public.music_categories c where c.id=v_key)) then
        raise exception 'Unknown music category' using errcode='23514';
      end if;
    end loop;
    if TG_TABLE_NAME='songs' then new.genre:=new.genres[1]; end if;
  elsif TG_TABLE_NAME='playlists' then
    if not (new.genre=any(v_known) or exists(select 1 from public.music_categories c where c.id=new.genre)) then
      raise exception 'Unknown music category' using errcode='23514';
    end if;
  else
    if not (new.genre=any(v_known) or new.genre=any(array['mandarin','english','japanese','korean','other_language']) or exists(select 1 from public.music_categories c where c.id=new.genre)) then
      raise exception 'Unknown chart' using errcode='23514';
    end if;
  end if;
  return new;
end $function$;
create or replace function private.limit_music_categories()
returns trigger language plpgsql security definer set search_path to ''
as $function$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.owner_id::text||':music_categories',0));
  new.name:=pg_catalog.btrim(new.name);
  if pg_catalog.lower(new.name)=any(array[
    'pop','rock','hip-hop & rap','electronic','r&b / soul','jazz','classical','soundtrack',
    'chinese music','instrumental','folk','k-pop','indie','other','chinese','english',
    'japanese','korean','other languages','all music','alternative','punk','metal','j-pop',
    'city pop','dance','funk','ambient','blues','piano','acoustic','singer-songwriter',
    'country','opera & choral','anime','latin','afrobeats','reggae','experimental','gospel',
    'trap','house','techno','dubstep','edm','lo-fi','mandopop','cantopop','new age'
  ]) then
    raise exception 'This category already exists' using errcode='23505';
  end if;
  if (select count(*) from public.music_categories c where c.owner_id=new.owner_id)>=3 then
    raise exception 'You can create up to three music categories' using errcode='23514';
  end if;
  return new;
end $function$;
