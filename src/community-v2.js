/* AILLEURS: a paper calendar, one music room, and a chronological forum. */
(() => {
  const $v = id => document.getElementById(id);
  const make = (tag, className = '', content) => el(tag, className, content);
  const imageUrl = path => publicFile('images', path);
  const query = new URLSearchParams(location.search);
  let day = validDay(query.get('day')) ? query.get('day') : today();
  const postSpaces = ['forum','daily','film','art','books'];
  const postNames = {forum:'Forum',daily:'Daily Life',film:'Film',art:'Art',books:'Books'};
  const postSpace = value => postSpaces.includes(value.replace(/-all$/, '')) ? value.replace(/-all$/, '') : null;
  const routeScreen = q => q.get('page') === 'following' ? 'following' : q.get('page') === 'explore' ? 'explore' : q.get('page') === 'lobby' ? 'lobby' : q.get('space') === 'playlists' ? 'playlists' : q.get('space') === 'group' ? 'group' : postSpaces.includes(q.get('space')) ? (q.get('space') === 'forum' && q.get('view') !== 'all' ? 'forum' : q.get('space') + '-all') : q.get('space') === 'music' && q.get('view') === 'hub' ? 'music-hub' : q.get('space') === 'music' || q.has('day') || location.hash.startsWith('#song-') ? (q.get('view') === 'all' || location.hash.startsWith('#song-') ? 'music-all' : 'music') : 'welcome';
  let screen = routeScreen(query);
  window.daytoneGroupId = query.get('group') || null;
  window.daytonePlaylistId = query.get('space')==='playlists' ? query.get('list') : null;
  window.daytonePlaylistGroup = query.get('space')==='playlists' ? query.get('group') : null;
  window.daytoneSpan = query.get('period') === 'all' ? 'all' : 'today';
  window.daytoneGroupPeriod = window.daytoneSpan;
  let monthCursor = day.slice(0, 7);
  let posts = [], postReactions = new Map(), postComments = new Map(), postCommentLikes = new Map();
  let selectedPostId = null, selectedSongId = null, selectedSong = null, loadId = 0;
  const screens = { welcome: 'welcome', following:'following-screen', explore:'explore-screen', lobby: 'taxi-lobby', 'music-hub': 'music-hub', playlists: 'playlists-screen', music: 'music-gallery', 'music-all': 'today', group: 'group-screen', forum: 'forum-rank', 'forum-all': 'generic-feed', 'daily-all':'generic-feed', 'film-all':'generic-feed', 'art-all':'generic-feed', 'books-all':'generic-feed' };
  const photoScenes = ['music-1.png', 'music-2.png', 'music-3.png'];
  const dateLabel = value => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z'));
  const copyIcon = () => { const node = make('span', 'paper-copy-icon'); node.setAttribute('aria-hidden', 'true'); return node; };
  function copyButton(value, label = 'Copy title') { const button = make('button', 'paper-copy'); button.type = 'button'; button.setAttribute('aria-label', label); button.title = label; button.append(copyIcon()); button.addEventListener('click', event => { event.stopPropagation(); void copyName(value); }); return button; }
  async function copyName(value) { try { await navigator.clipboard.writeText(value); toast('Copied: ' + value + '. Search for it in your own app.'); } catch { toast('Could not copy. Select the title to copy it.'); } }
  function updateRoute(push = true) { const url = screen === 'welcome' ? './' : screen === 'following' || screen === 'explore' ? '?page='+screen : screen === 'lobby' ? '?page=lobby&day=' + day : screen === 'playlists' ? '?space=playlists' + (window.daytonePlaylistId?'&list='+encodeURIComponent(window.daytonePlaylistId):'') + (window.daytonePlaylistGroup?'&group='+encodeURIComponent(window.daytonePlaylistGroup):'') : screen === 'group' ? '?space=group&group=' + encodeURIComponent(window.daytoneGroupId || '') + '&day=' + day + '&view=top' + (window.daytoneGroupPeriod === 'all' ? '&period=all' : '') : screen === 'music-hub' ? '?space=music&day=' + day + '&view=hub' : '?space=' + (postSpace(screen) || 'music') + '&day=' + day + '&view=' + (screen.endsWith('-all') ? 'all' : 'top') + (screen.startsWith('music') && window.daytoneGenre !== 'all' ? '&genre=' + window.daytoneGenre : '') + (screen === 'music' && window.daytoneSpan === 'all' ? '&period=all' : ''); (push ? history.pushState : history.replaceState).call(history, null, '', url); }
  function show(next, push = true) {
    screen = next; document.body.dataset.screen = next; document.body.dataset.space = next.startsWith('music') || next==='playlists' ? 'music' : postSpace(next) || (next === 'group' ? 'group' : 'none');
    for (const id of new Set(Object.values(screens))) $v(id).hidden = id !== screens[next];
    $v('current-space-label').textContent = next==='following'?'FOLLOWING':next==='explore'?'LIBRARY':next.startsWith('music') || next === 'group' || next==='playlists' ? 'MUSIC' : postSpace(next) ? postNames[postSpace(next)].toUpperCase() : 'AILLEURS';
    $v('floating-post').hidden = next !== 'music-all' && !postSpace(next);
    if (next === 'welcome') renderCalendar();
    if (next === 'lobby') renderLobby();
    if (next === 'music-hub') window.DaytoneMusicRooms?.renderHub();
    if (next === 'playlists') window.DaytonePlaylists?.render();
    if (next === 'group') window.DaytoneMusicRooms?.renderGroup();
    if (next === 'music' || next === 'music-all') {
      if (selectedDay !== day) setDay(day);
      if (next === 'music') { renderMusicGallery(); if (window.daytoneSpan === 'all') void window.DaytoneMusicRooms?.loadAllTimePublic(); }
      else { viewMode = 'all'; renderSongs(); }
    }
    if (postSpace(next)) { if (next === 'forum') renderForumTop(); else renderForumAll(); void loadPosts(); }
    if (push) updateRoute(true);
    const active = $v(screens[next]); active.classList.remove('entering'); void active.offsetWidth; active.classList.add('entering');
    window.dispatchEvent(new CustomEvent('daytone:screen-changed',{detail:{screen:next,day}}));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function renderLobby() {
    const index = ((Math.round((Date.parse(day + 'T00:00:00Z') - Date.parse('2026-10-28T00:00:00Z')) / 86400000) % 3) + 3) % 3;
    const scene = ['mirror', 'cab', 'cinema'][index];
    $v('taxi-lobby').dataset.scene = scene;
    $v('taxi-lobby').querySelector('.taxi-image').src = '' + ['taxi-driver.png', 'taxi-cab.png', 'taxi-cinema.png'][index];
    $v('lobby-date').textContent = dateLabel(day);
    window.DaytoneAppearance?.render();
  }
  function setChosenDay(value) { if (!validDay(value)) return; day = value; monthCursor = value.slice(0, 7); renderCalendar(); if (screen === 'lobby') renderLobby(); window.DaytoneMusicRooms?.renderCalendarCharts(); window.dispatchEvent(new CustomEvent('daytone:calendar-day',{detail:{day}})); }
  function renderCalendar() {
    const [year, month] = monthCursor.split('-').map(Number);
    $v('calendar-month').textContent = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(new Date(Date.UTC(year, month - 1, 1)));
    $v('calendar-picked').textContent = dateLabel(day);
    const grid = $v('calendar-grid'); grid.replaceChildren();
    for (const name of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) grid.append(make('span', 'calendar-weekday', name));
    const start = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
    for (let i = 0; i < start; i++) grid.append(make('span', 'calendar-gap'));
    const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let n = 1; n <= count; n++) {
      const value = monthCursor + '-' + String(n).padStart(2, '0');
      const button = make('button', 'calendar-day' + (value === day ? ' chosen' : '') + (value === today() ? ' today-mark' : ''), n);
      button.type = 'button'; button.setAttribute('aria-label', 'Choose ' + value); button.setAttribute('aria-pressed', String(value === day)); button.addEventListener('click', () => setChosenDay(value)); grid.append(button);
    }
  }
  function gallerySupport(song) { return window.daytoneSpan === 'all' ? Number(song.supporters || 0) : supportCount(song); }
  function sortedSongs() { return (window.daytoneSpan === 'all' ? (window.DaytoneMusicRooms?.allTimePublicSongs() || []) : songs.filter(x => songInChart(x,window.daytoneGenre))).sort((a, b) => gallerySupport(b) - gallerySupport(a) || b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id)); }
  function record(song, rank) {
    const wrap = make('article', 'gallery-record' + (rank === 1 ? ' first' : '') + (song ? ' has-song' : ' is-empty'));
    const scene = make('img', 'scene-image'); scene.src = rank === 1 ? photoScenes[1] : rank === 2 ? photoScenes[0] : photoScenes[2]; scene.alt = ''; scene.hidden = window.daytoneGenre !== 'all'; wrap.append(scene);
    const shade = make('div', 'scene-shade'); wrap.append(shade);
    const badge = make('span', 'record-rank', rank === 1 ? 'TOP 01' : 'TOP 0' + rank); wrap.append(badge);
    const vinyl = make('button', 'vinyl' + (rank === 1 ? ' vinyl-main' : '')); vinyl.type = 'button'; vinyl.setAttribute('aria-label', song ? (window.DaytoneListen?.actionLabel(song) || 'Find ' + song.title) : 'No songs yet'); vinyl.disabled = !song;
    const inner = make('span', 'vinyl-center');
    if (song?.cover_path) { const img = make('img'); img.src = imageUrl(song.cover_path); img.alt = song.title + ' cover'; inner.append(img); }
    else inner.append(make('span', '', 'AILLEURS'));
    vinyl.append(inner); if (song) vinyl.addEventListener('click', () => window.DaytoneListen?.open(song)); wrap.append(vinyl);
    const info = make('div', 'record-info');
    if (song) { info.append(make('small', '', '@' + song.nickname + ' · ' + gallerySupport(song) + ' supporters'), make('h3', '', song.title)); if (song.artist) info.append(make('p', '', song.artist)); info.append(copyButton(song.title, 'Copy song title')); }
    else info.append(make('h3', '', rank === 1 ? 'Welcome to today.' : 'The next song is yours to share.'), make('p', '', rank === 1 ? 'The record is turning, waiting for a song for today.' : '')); wrap.append(info);
    return wrap;
  }
  function renderMusicGallery() {
    if (screen !== 'music') return;
    const genre = window.daytoneGenre;
    $v('music-gallery').dataset.genre = genre;
    const palette=window.DaytoneMusicRooms?.genrePalette(genre);
    if(palette){$v('music-gallery').style.setProperty('--genre-ink',palette[0]);$v('music-gallery').style.setProperty('--genre-paper',palette[1]);}
    $v('music-gallery-title').textContent = genre === 'all' ? 'MUSIC SO GOOD,\nEVEN DEVIL MAY CRY' : musicGenreName(genre).toUpperCase() + '\nIN ROTATION';
    $v('music-gallery').querySelector('.gallery-heading small').textContent = genre === 'all' ? 'MUSIC / AILLEURS' : 'MUSIC / ' + musicGenreName(genre).toUpperCase();
    $v('music-gallery-date').textContent = window.daytoneSpan === 'all' ? 'ALL-TIME TOP 5 / EVERY DAY SO FAR' : dateLabel(day) + ' / TODAY’S TOP 5';
    $v('music-period-today').classList.toggle('selected', window.daytoneSpan === 'today');
    $v('music-period-all').classList.toggle('selected', window.daytoneSpan === 'all');
    const sorted = sortedSongs(); const host = $v('music-top-visual'); host.replaceChildren();
    host.append(record(sorted[1], 2), record(sorted[0], 1), record(sorted[2], 3));
    const rest = $v('music-top-rest'); rest.replaceChildren();
    for (let i = 3; i < Math.min(sorted.length, 5); i++) {
      const song = sorted[i], row = make('div', 'music-extra'), open = make('button', 'music-extra-open');
      open.type = 'button'; open.append(make('span', '', '0' + (i + 1)), make('strong', '', song.title), make('small', '', '@' + song.nickname));
      open.addEventListener('click', () => openMusicDiscussion(song.id));
      row.append(open, copyButton(song.title, 'Copy song title')); rest.append(row);
    }
  }
  async function openMusicDiscussion(value) {
    const id=typeof value==='object'?value.id:value;
    const song=songs.find(x=>x.id===id)||(window.DaytoneMusicRooms?.allTimePublicSongs()||[]).find(x=>x.id===id)||(typeof value==='object'?value:null);
    if(!song)return;
    selectedSongId=id;selectedSong=song;
    const host=$v('music-discussion-body');
    if(!songs.some(x=>x.id===id)&&client){
      host.replaceChildren(make('p','collection-status','Loading discussion…'));
      showDialog('music-discussion-dialog');
      try{
        const [voteRows,reactionRows,commentRows]=await Promise.all([
          fetchEveryRow(()=>client.from('song_votes').select('song_id,user_id').eq('song_id',id)),
          fetchEveryRow(()=>client.from('reactions').select('song_id,user_id,emoji').eq('song_id',id)),
          fetchEveryRow(()=>client.from('comments').select('id,song_id,user_id,nickname,body,image_path,parent_id,created_at').eq('song_id',id).order('created_at',{ascending:true}))
        ]);
        if(selectedSongId!==id||!$v('music-discussion-dialog').open)return;
        votes.set(id,voteRows);reactions.set(id,reactionRows);comments.set(id,commentRows);
        if(commentRows.length){const likes=await fetchEveryRow(()=>client.from('comment_likes').select('comment_id,user_id').in('comment_id',commentRows.map(row=>row.id)));for(const row of commentRows)commentLikes.set(row.id,likes.filter(like=>like.comment_id===row.id).map(like=>like.user_id));}
      }catch(error){if(selectedSongId===id)host.replaceChildren(make('p','collection-status','Could not load this discussion.'));return;}
    }
    if(selectedSongId!==id)return;
    const rank=sortedSongs().findIndex(x=>x.id===id)+1;
    host.replaceChildren(createCard(song,rank,true));showDialog('music-discussion-dialog');void renderSongConnections(song);
  }
  async function renderSongConnections(song){
    if(!client)return;
    const host=$v('music-discussion-body'),section=make('section','song-connections');section.append(make('h3','','Discover more'));
    const content=make('div','song-connections-content');content.append(make('p','song-connections-empty','Finding other songs…'));section.append(content);host.append(section);
    try{
      const columns='id,day,title,artist,nickname,cover_path,audio_path,source_url,genres,genre,language,note,created_at';
      const normalize=value=>String(value||'').normalize('NFKC').toLocaleLowerCase().replace(/\b(feat\.?|ft\.?|featuring|with)\b.*$/i,'').replace(/[\s.,·&/()\[\]_-]+/g,'').trim();
      const artistKey=normalize(song.artist);
      const artistSearch=String(song.artist||'').split(/\s*(?:,|&|·|\/| feat\.? | ft\.? )\s*/i)[0]?.trim();
      const [artistResult,recentResult]=await Promise.all([
        artistSearch&&artistSearch.length>=2?client.from('songs').select(columns).ilike('artist','%'+artistSearch.replace(/[%_]/g,'')+'%').neq('id',song.id).limit(60):Promise.resolve({data:[],error:null}),
        client.from('songs').select(columns).neq('id',song.id).order('created_at',{ascending:false}).limit(350)
      ]);
      if(artistResult.error||recentResult.error)throw artistResult.error||recentResult.error;
      if(!section.isConnected||selectedSongId!==song.id)return;
      content.replaceChildren();
      const all=new Map([...(artistResult.data||[]),...(recentResult.data||[])].map(row=>[row.id,row]));
      const seen=new Set([normalize(song.title)+'|'+normalize(song.artist)]),distinctRows=[...all.values()].sort((a,b)=>b.created_at.localeCompare(a.created_at)).filter(row=>{const key=normalize(row.title)+'|'+normalize(row.artist);if(seen.has(key))return false;seen.add(key);return true;});
      const sameArtist=distinctRows.filter(row=>artistKey&&normalize(row.artist)===artistKey).slice(0,5);
      const supporters=(votes.get(song.id)||[]).map(row=>row.user_id).filter(Boolean).slice(0,30);
      let alsoLiked=new Set();
      if(supporters.length){const result=await client.from('song_votes').select('song_id,user_id').in('user_id',supporters).limit(1000);if(!result.error)alsoLiked=new Set((result.data||[]).map(row=>row.song_id));}
      if(!section.isConnected||selectedSongId!==song.id)return;
      const genres=new Set((song.genres?.length?song.genres:[song.genre]).filter(key=>key&&key!=='other'));
      const terms=value=>{const valueText=String(value||'').normalize('NFKC').toLocaleLowerCase();const result=new Set(valueText.match(/[a-zà-ÿ]{4,}|[\p{Script=Han}]{2,}|[\p{Script=Hiragana}\p{Script=Katakana}]{3,}/gu)||[]);for(const token of [...result])if(/[\p{Script=Han}]/u.test(token)&&token.length>3)for(let i=0;i<token.length-1;i++)result.add(token.slice(i,i+2));return result;};
      const sourceTerms=terms(song.note);
      const ranked=distinctRows.filter(row=>!sameArtist.some(item=>item.id===row.id)&&!(artistKey&&normalize(row.artist)===artistKey)).map(row=>{
        const rowGenres=row.genres?.length?row.genres:[row.genre];
        const overlap=rowGenres.filter(key=>genres.has(key)).length;
        const sharedTerms=[...terms(row.note)].filter(term=>sourceTerms.has(term)).length;
        const social=alsoLiked.has(row.id);
        const language=Boolean(song.language&&song.language===row.language&&song.language!=='other_language');
        const score=(social?12:0)+Math.min(sharedTerms,3)*4+Math.min(overlap,2)*2+(language?1:0);
        const reason=sharedTerms?'Shared words in the notes':overlap&&language?'Same category and language':overlap?'Same category':'Liked by listeners of this song';
        return {row,score,reason,social,sharedTerms,overlap,language};
      }).filter(item=>item.score>=2).sort((a,b)=>b.score-a.score||b.row.created_at.localeCompare(a.row.created_at));
      const related=ranked.filter(item=>item.sharedTerms>=2||(item.sharedTerms>=1&&item.overlap>0)||(item.overlap>0&&item.language)).slice(0,6);
      const relatedIds=new Set(related.map(item=>item.row.id));
      const listenerPicks=ranked.filter(item=>item.social&&!relatedIds.has(item.row.id)).slice(0,5).map(item=>({...item,reason:'Liked by listeners of this song'}));
      const addGroup=(title,items)=>{if(!items.length)return;const group=make('div','song-connection-group');group.append(make('h4','',title));for(const {row,reason} of items){const item=make('article','song-connection-item'),art=make('button','song-connection-art'),cover=songCoverUrl(row);art.type='button';art.title=window.DaytoneListen?.actionLabel(row)||'Play '+row.title;art.setAttribute('aria-label',art.title);if(cover){const image=make('img');image.src=cover;image.alt='';image.loading='lazy';art.append(image);}else art.textContent='♫';art.addEventListener('click',()=>window.DaytoneListen?.open(row));const detail=make('button','song-connection-detail');detail.type='button';detail.append(make('strong','',row.title),make('small','',[row.artist,row.nickname].filter(Boolean).join(' · ')));if(reason)detail.append(make('em','',reason));detail.addEventListener('click',()=>openMusicDiscussion(row));item.append(art,detail);group.append(item);}content.append(group);};
      addGroup('More by '+song.artist,sameArtist.map(row=>({row,reason:'Same artist'})));
      addGroup('Related songs',related);
      addGroup('Listeners also supported',listenerPicks);
      if(!sameArtist.length&&!related.length&&!listenerPicks.length)addGroup('Recent shares',distinctRows.slice(0,5).map(row=>({row,reason:'Recently shared'})));
      const artistNames=[...new Set(related.map(item=>item.row.artist).filter(Boolean))].slice(0,5);
      if(artistNames.length){const artists=make('div','song-related-artists');artists.append(make('h4','','Artists in related shares'));for(const name of artistNames){const match=related.find(item=>item.row.artist===name);const button=make('button','',name);button.type='button';button.addEventListener('click',()=>openMusicDiscussion(match.row));artists.append(button);}content.append(artists);}
      if(!content.childElementCount)content.append(make('p','song-connections-empty','No related shares yet. Try another song.'));
    }catch{if(section.isConnected)content.replaceChildren(make('p','song-connections-empty','Other songs are unavailable right now.'));}
  }
  function forumScore(post) { return (postComments.get(post.id) || []).length * 2 + (postReactions.get(post.id) || []).length; }
  function rankedPosts() { return [...posts].sort((a, b) => forumScore(b) - forumScore(a) || b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id)); }
  async function loadPosts() {
    if (!client || !postSpace(screen)) return;
    const category=postSpace(screen),request = ++loadId, loadingDay = day; $v('generic-status').textContent = 'Loading '+postNames[category]+'…';
    try {
      const next = await fetchEveryRow(() => client.from('posts').select('id,owner_id,day,category,post_type,title,creator,body,nickname,image_path,source_url,created_at').eq('category', category).eq('day', loadingDay).order('created_at', { ascending: false }).order('id'));
      const rMap = new Map(), cMap = new Map(), lMap = new Map();
      for (let start = 0; start < next.length; start += 50) {
        const ids = next.slice(start, start + 50).map(x => x.id);
        const [rr, cc] = await Promise.all([
          fetchEveryRow(() => client.from('post_reactions').select('post_id,user_id,emoji').in('post_id', ids).order('post_id').order('user_id')),
          fetchEveryRow(() => client.from('post_comments').select('id,post_id,user_id,nickname,body,image_path,parent_id,created_at').in('post_id', ids).order('created_at').order('id'))
        ]);
        for (const row of rr) { const list = rMap.get(row.post_id) || []; list.push(row); rMap.set(row.post_id, list); }
        for (const row of cc) { const list = cMap.get(row.post_id) || []; list.push(row); cMap.set(row.post_id, list); }
        for(let offset=0;offset<cc.length;offset+=100){const commentIds=cc.slice(offset,offset+100).map(item=>item.id);const likes=await fetchEveryRow(()=>client.from('post_comment_likes').select('comment_id,user_id').in('comment_id',commentIds));for(const like of likes){const list=lMap.get(like.comment_id)||[];list.push(like.user_id);lMap.set(like.comment_id,list);}}
      }
      if (request !== loadId || loadingDay !== day || postSpace(screen)!==category) return;
      posts = next; postReactions = rMap; postComments = cMap; postCommentLikes = lMap; $v('generic-status').textContent = next.length ? '' : category==='books'?'No books shared yet today.':'No '+postNames[category]+' posts yet today.';
      if (screen === 'forum') renderForumTop(); else renderForumAll();
      window.dispatchEvent(new Event('daytone:forums-loaded'));
      if ($v('generic-discussion-dialog').open && selectedPostId) { const selected = posts.find(x => x.id === selectedPostId); if (selected) renderDiscussion(selected); else $v('generic-discussion-dialog').close(); }
    } catch (error) { if (request === loadId) $v('generic-status').textContent = 'Could not load: ' + (error.message || 'please try again'); }
  }
  function renderForumTop() {
    if (screen !== 'forum') return;
    $v('forum-rank-date').textContent = dateLabel(day) + ' / Ranked by discussion and reactions';
    const host = $v('forum-top-three'); host.replaceChildren(); const top = rankedPosts().slice(0, 3);
    if (!top.length) { const empty = make('div', 'forum-top-empty'); empty.append(make('span', '', '01 / 02 / 03'), make('h2', '', 'Start today’s conversation.'), make('p', '', 'One question can bring many voices together.')); host.append(empty); return; }
    top.forEach((post, index) => host.append(postCard(post, index + 1, true)));
  }
  function postCard(post, rank, featured = false) {
    const card = make('article', featured ? 'forum-feature' : 'generic-card forum-list-card'); card.id = 'post-' + post.id;
    const photo = make('button', featured ? 'forum-feature-photo' : 'generic-card-photo' + (post.image_path ? '' : ' no-photo')); photo.type = 'button'; photo.setAttribute('aria-label', 'Open ' + post.title + ' discussion');
    if (post.image_path) { const img = make('img'); img.src = imageUrl(post.image_path); img.alt = post.title + ' photo'; img.loading = 'lazy'; photo.append(img); }
    else photo.append(make('span', 'forum-photo-placeholder', post.title.slice(0, 2)));
    photo.addEventListener('click', () => openDiscussion(post.id)); card.append(photo);
    const body = make('div', featured ? 'forum-feature-body' : 'generic-card-body');
    body.append(make('small', 'forum-card-rank', featured ? 'NO. 0' + rank + ' / ' + forumScore(post) + '  replies and reactions' : new Date(post.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })));
    body.append(make('h3', '', post.title));
    const byline=make('p','byline'),member=make('button','member-link','@'+post.nickname);member.type='button';member.addEventListener('click',()=>window.DaytoneSocial?.openProfile(post.owner_id,post.nickname));byline.append(member,document.createTextNode(post.category==='forum'?' · '+({ question: 'Question', discussion: 'Discussion', debate: 'Debate' }[post.post_type] || 'Discussion') : post.creator?' · '+post.creator:''));body.append(byline);
    if (post.body) body.append(make('p', 'summary', post.body.length > 180 ? post.body.slice(0, 180) + '…' : post.body));
    const actions = make('div', 'card-actions'); addReactionButtons(actions, post); actions.append(copyButton(post.title, 'Copy title')); if(post.owner_id===user?.id){const edit=make('button','author-edit-link','Edit post');edit.type='button';edit.addEventListener('click',()=>window.DaytoneAuthorTools?.openPost(post));actions.append(edit);} const discuss = make('button', 'discussion-open', 'Discussion ' + (postComments.get(post.id) || []).length + ' ↗'); discuss.type = 'button'; discuss.addEventListener('click', () => openDiscussion(post.id)); actions.append(discuss); body.append(actions); card.append(body); return card;
  }
  function renderForumAll() {
    const category=postSpace(screen);if(!category||screen==='forum')return;
    $v('generic-kicker').textContent = postNames[category].toUpperCase() + ' / ' + day; $v('generic-feed-title').textContent = category==='forum'?'All forums today':postNames[category]+' shared today'; $v('generic-sort-note').textContent = 'By time · newest first'; $v('generic-post').textContent = category==='forum'?'＋ Start a forum':category==='books'?'＋ Share a book':'＋ Share '+postNames[category];
    $v('generic-all').hidden = true; $v('generic-top').hidden = category!=='forum'; $v('generic-date').value = day; renderForumWeek();
    const sorted = [...posts].sort((a, b) => b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id));
    $v('generic-count').textContent = category==='books'?sorted.length+' books shared':sorted.length + ' '+postNames[category]+' posts'; $v('generic-empty').hidden = sorted.length > 0;
    const host = $v('generic-list'); host.replaceChildren(...sorted.map(post => postCard(post, 0)));
    if (location.hash.startsWith('#post-')) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'center' });
  }
  function renderForumWeek() { const rail = $v('generic-week-rail'); rail.replaceChildren(); for (let offset = -3; offset <= 3; offset++) { const value = addDays(day, offset), button = make('button', 'day-tile' + (value === day ? ' selected' : '')); button.type = 'button'; button.append(make('small', '', new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z'))), make('strong', '', value.slice(-2))); button.addEventListener('click', () => setForumDay(value)); rail.append(button); } }
  function setForumDay(value) { if (!validDay(value)) return; day = value; updateRoute(false); renderForumAll(); void loadPosts(); }
  function addReactionButtons(host, post) { const rows = postReactions.get(post.id) || []; for (const symbol of emoji) { const count = rows.filter(x => x.emoji === symbol).length, chosen = rows.some(x => x.emoji === symbol && x.user_id === user?.id); const button = make('button', chosen ? 'chosen' : '', symbol + ' ' + count); button.type = 'button'; button.setAttribute('aria-pressed', String(chosen)); button.addEventListener('click', () => void reactToPost(post.id, symbol, chosen)); host.append(button); } }
  async function reactToPost(id, symbol, chosen) { if (!requireAccount()) return; try { const result = chosen ? await client.from('post_reactions').delete().eq('post_id', id).eq('user_id', user.id) : await client.from('post_reactions').upsert({ post_id: id, user_id: user.id, emoji: symbol }, { onConflict: 'post_id,user_id' }); if (result.error) throw result.error; if(['welcome','following','explore'].includes(screen))await openHomePostDiscussion(id);else await loadPosts(); window.dispatchEvent(new CustomEvent('daytone:posts-changed',{detail:{id}})); } catch (error) { toast(error.message || 'Reaction could not be saved. Please try again.'); } }
  function openDiscussion(id) { const post = posts.find(x => x.id === id); if (!post) return; selectedPostId = id; renderDiscussion(post); showDialog('generic-discussion-dialog'); }
  async function openHomePostDiscussion(id){
    if(!client)return;
    try{
      const result=await client.from('posts').select('id,owner_id,day,category,post_type,title,creator,body,nickname,image_path,source_url,created_at').eq('id',id).single();
      if(result.error)throw result.error;
      const [reactions,comments]=await Promise.all([
        fetchEveryRow(()=>client.from('post_reactions').select('post_id,user_id,emoji').eq('post_id',id).order('user_id')),
        fetchEveryRow(()=>client.from('post_comments').select('id,post_id,user_id,nickname,body,image_path,parent_id,created_at').eq('post_id',id).order('created_at').order('id'))
      ]);
      const likeRows=comments.length?await fetchEveryRow(()=>client.from('post_comment_likes').select('comment_id,user_id').in('comment_id',comments.map(item=>item.id))):[];
      const likes=new Map();for(const like of likeRows){const list=likes.get(like.comment_id)||[];list.push(like.user_id);likes.set(like.comment_id,list);}
      posts=[result.data];postReactions=new Map([[id,reactions]]);postComments=new Map([[id,comments]]);postCommentLikes=likes;openDiscussion(id);
    }catch(error){toast(error.message||'Could not open this discussion.');}
  }
  function renderDiscussion(post) {
    const host = $v('generic-discussion-body'); host.replaceChildren();
    if (post.image_path) { const img = make('img', 'discussion-photo'); img.src = imageUrl(post.image_path); img.alt = post.title + ' photo'; host.append(img); }
    const heading = make('h2', '', post.title); heading.id = 'discussion-title'; host.append(heading);
    const byline=make('p','byline'),member=make('button','member-link','@'+post.nickname);member.type='button';member.addEventListener('click',()=>window.DaytoneSocial?.openProfile(post.owner_id,post.nickname));byline.append(member);host.append(byline);
    if (post.body) host.append(make('p', '', post.body));
    if (post.source_url) { const link = make('a', 'open-link', 'Open related link ↗'); link.href = post.source_url; link.target = '_blank'; link.rel = 'noopener noreferrer'; host.append(link); }
    host.append(copyButton(post.title, 'Copy forum title'));
    if(post.owner_id===user?.id){const edit=make('button','author-edit-link','Edit forum');edit.type='button';edit.addEventListener('click',()=>window.DaytoneAuthorTools?.openPost(post));host.append(edit);}
    const actions = make('div', 'card-actions'); addReactionButtons(actions, post); host.append(actions);
    const list = make('div', 'comment-list'), items = postComments.get(post.id) || []; list.append(make('h3', 'publisher-heading', 'Discussion · ' + items.length));
    const byId=new Map(items.map(item=>[item.id,item]));
    for (const item of items) {
      const line=make('div','comment'+(item.parent_id?' is-reply':'')),head=make('div','comment-head');
      const author=make('button','member-link',item.nickname);author.type='button';author.addEventListener('click',()=>window.DaytoneSocial?.openProfile(item.user_id,item.nickname));head.append(author,make('time','',new Date(item.created_at).toLocaleString('en-US',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})));line.append(head);
      const parent=byId.get(item.parent_id);if(parent)line.append(make('span','comment-reply-context','↳ @'+parent.nickname));
      if(item.body)line.append(make('p','',item.body));
      if(item.image_path){const img=make('img');img.src=imageUrl(item.image_path);img.alt=item.nickname+' photo';img.loading='lazy';line.append(img);}
      const tools=make('div','comment-tools'),reply=make('button','','Reply');reply.type='button';
      reply.addEventListener('click',()=>{if(!requireAccount())return;form.dataset.parentId=item.id;replyLabel.textContent='Replying to @'+item.nickname;replyTarget.hidden=false;textarea.placeholder='Reply to @'+item.nickname+'…';textarea.focus();});tools.append(reply);
      const mention=make('button','','@ Mention');mention.type='button';mention.addEventListener('click',()=>{if(!requireAccount())return;textarea.value+=(textarea.value&&!/\s$/.test(textarea.value)?' ':'')+'@'+item.nickname+' ';textarea.focus();});tools.append(mention);
      const likedBy=postCommentLikes.get(item.id)||[],like=make('button','comment-like'+(likedBy.includes(user?.id)?' chosen':''),'♡ '+likedBy.length);like.type='button';like.setAttribute('aria-label','Like reply by '+item.nickname);like.setAttribute('aria-pressed',String(likedBy.includes(user?.id)));like.addEventListener('click',()=>void togglePostCommentLike(item.id,post.id,likedBy.includes(user?.id)));tools.append(like);
      if(likedBy.includes(post.owner_id))tools.append(make('span','author-liked','♥ Liked by '+post.nickname));
      if(item.user_id===user?.id){const edit=make('button','author-edit-link','Edit');edit.type='button';edit.addEventListener('click',()=>window.DaytoneAuthorTools?.openComment('post_comments',item));tools.append(edit);}line.append(tools);list.append(line);
    }host.append(list);
    const form = make('form', 'comment-form'), textarea = make('textarea'); textarea.name = 'body'; textarea.maxLength = 800; textarea.rows = 3; textarea.placeholder = 'Ask a question, share a thought, or just post a photo…';
    const replyTarget=make('div','comment-reply-target');replyTarget.hidden=true;const replyLabel=make('span','','');replyTarget.append(replyLabel);const clearReply=make('button','','×');clearReply.type='button';clearReply.setAttribute('aria-label','Cancel reply');clearReply.addEventListener('click',()=>{delete form.dataset.parentId;replyTarget.hidden=true;textarea.placeholder='Ask a question, share a thought, or just post a photo…';});replyTarget.append(clearReply);form.append(replyTarget);
    const upload = make('input'); upload.type = 'file'; upload.name = 'image'; upload.accept = 'image/jpeg,image/png,image/webp,image/gif'; upload.setAttribute('aria-label', 'Comment photo or meme');
    const submit = make('button', '', 'Post reply ↗'); submit.type = 'submit'; const row = make('div', 'comment-actions'), error = make('div', 'comment-error'); error.setAttribute('role', 'alert'); row.append(upload, submit); form.append(textarea, row, error); form.addEventListener('submit', event => void publishComment(event, post.id, error, submit)); host.append(form);
  }
  async function publishComment(event, id, errorNode, button) { event.preventDefault(); if (!requireAccount()) return; const form = event.currentTarget, body = form.elements.body.value.trim(), file = form.elements.image.files[0]; errorNode.textContent = ''; if (!body && !file) { errorNode.textContent = 'Write a reply or choose a photo.'; return; } button.disabled = true; button.textContent = 'Posting…'; const uploaded = []; try { const path = await uploadFile('images', await prepareImage(file), imageTypes, 1024 * 1024); if (path) uploaded.push({ bucket: 'images', path }); const result = await client.from('post_comments').insert({ post_id: id, user_id: user.id, nickname: profile.nickname, body, image_path: path, parent_id: form.dataset.parentId || null }); if (result.error) throw result.error; if(['welcome','following','explore'].includes(screen))await openHomePostDiscussion(id);else await loadPosts(); window.dispatchEvent(new CustomEvent('daytone:posts-changed',{detail:{id}})); toast('Reply posted.'); } catch (error) { await cleanUploads(uploaded); errorNode.textContent = error.message || 'Could not publish. Please try again.'; } finally { button.disabled = false; button.textContent = 'Post reply ↗'; } }
  async function togglePostCommentLike(commentId,postId,chosen){if(!requireAccount())return;try{const query=client.from('post_comment_likes'),result=chosen?await query.delete().eq('comment_id',commentId).eq('user_id',user.id):await query.insert({comment_id:commentId,user_id:user.id});if(result.error)throw result.error;if(['welcome','following','explore'].includes(screen))await openHomePostDiscussion(postId);else await loadPosts();window.dispatchEvent(new CustomEvent('daytone:posts-changed',{detail:{id:postId}}));}catch(error){toast(error.message||'Could not save like.');}}
  function openForumPost() { if (!requireAccount()) return; const category=postSpace(screen)||'forum';$v('generic-post-title').textContent = category==='forum'?'Start a forum':category==='books'?'Share a book':'Share '+postNames[category];$v('generic-type-field').classList.toggle('hidden',category!=='forum');$v('generic-title-label').textContent = category==='forum'?'Forum title':category==='daily'?'Title / thought':category==='film'?'Film title':category==='books'?'Book title':'Artwork title';$v('generic-creator-label').textContent=category==='books'?'Author (optional)':'Creator (optional)';$v('generic-post-dialog').querySelector('.dialog-intro').textContent='Up to three posts here each day. Only the title is required; a photo and note are optional.';$v('generic-post-error').textContent = ''; showDialog('generic-post-dialog'); }
  async function publishPost(event) {
    event.preventDefault(); if (!requireAccount()) return;
    const form = $v('generic-post-form'), data = new FormData(form), title = String(data.get('title') || '').trim(), creator = String(data.get('creator') || '').trim(), body = String(data.get('body') || '').trim(), urlText = String(data.get('source_url') || '').trim(), file = form.elements.image.files[0], errorNode = $v('generic-post-error');
    errorNode.textContent = ''; if (!title) { errorNode.textContent = 'Enter a forum title.'; return; }
    let sourceUrl = null; if (urlText) { try { const url = new URL(urlText); if (url.protocol !== 'https:') throw Error(); sourceUrl = url.href; } catch { errorNode.textContent = 'Links must start with https://.'; return; } }
    const button = $v('generic-post-submit'); button.disabled = true; button.textContent = 'Posting…'; const uploaded = [];
    try { const category=postSpace(screen)||'forum',publishDay = today(), usedResult = await client.from('posts').select('daily_slot').eq('owner_id', user.id).eq('day', publishDay).eq('category', category); if (usedResult.error) throw usedResult.error; const used = new Set((usedResult.data || []).map(x => x.daily_slot)); if (used.size >= 3) throw Error('You have shared three posts in this room today. Come back tomorrow.'); const path = await uploadFile('images', await prepareImage(file), imageTypes, 1024 * 1024); if (path) uploaded.push({ bucket: 'images', path }); const record = { id: crypto.randomUUID(), owner_id: user.id, day: publishDay, category, post_type: category==='forum'?String(data.get('post_type') || 'question'):'share', title, creator, body, nickname: profile.nickname, image_path: path, source_url: sourceUrl }; let saved = false; for (const slot of [1, 2, 3]) { if (used.has(slot)) continue; const result = await client.from('posts').insert({ ...record, daily_slot: slot }); if (!result.error) { saved = true; break; } if (result.error.code !== '23505') throw result.error; } if (!saved) throw Error('You have shared three posts in this room today. Come back tomorrow.'); form.reset(); $v('generic-post-dialog').close(); day = publishDay; show(category==='forum'?'forum':category+'-all'); await loadPosts(); window.dispatchEvent(new CustomEvent('daytone:posts-changed',{detail:{id:record.id,category}})); toast('Shared in '+postNames[category]+'.'); } catch (error) { await cleanUploads(uploaded); errorNode.textContent = error.message || 'Could not publish. Please try again.'; } finally { button.disabled = false; button.textContent = 'Publish post ↗'; }
  }
  function syncUrl() { const q = new URLSearchParams(location.search); day = validDay(q.get('day')) ? q.get('day') : today(); monthCursor = day.slice(0, 7); window.daytoneGenre = musicCharts.some(([id]) => id === q.get('genre')) ? q.get('genre') : 'all'; window.daytoneGroupId = q.get('space')==='group' ? q.get('group') : null; window.daytonePlaylistId=q.get('space')==='playlists'?q.get('list'):null;window.daytonePlaylistGroup=q.get('space')==='playlists'?q.get('group'):null;window.daytoneSpan = q.get('period') === 'all' ? 'all' : 'today'; window.daytoneGroupPeriod = window.daytoneSpan; show(routeScreen(q), false); }
  $v('welcome-name').textContent = profile?.nickname || user?.user_metadata?.nickname || 'friend'; renderCalendar(); show(screen, false);
  $v('calendar-prev').addEventListener('click', () => { const [y, m] = monthCursor.split('-').map(Number); monthCursor = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7); renderCalendar(); });
  $v('calendar-next').addEventListener('click', () => { const [y, m] = monthCursor.split('-').map(Number); monthCursor = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7); renderCalendar(); });
  $v('start-day').addEventListener('click', () => show('lobby'));
  $v('lobby-back').addEventListener('click', () => show('welcome'));
  $v('space-select').addEventListener('click', () => show('welcome'));
  document.querySelectorAll('.taxi-mirror button[data-space]').forEach(button => button.addEventListener('click', () => show(button.dataset.space === 'music' ? 'music-hub' : button.dataset.space === 'forum' ? 'forum' : button.dataset.space+'-all')));
  $v('music-back-lobby').addEventListener('click', () => show('music-hub'));
  $v('forum-back-lobby').addEventListener('click', () => show('lobby'));
  $v('music-gallery-all').addEventListener('click', () => show('music-all'));
  $v('music-period-today').addEventListener('click', () => { window.daytoneSpan = 'today'; show('music'); });
  $v('music-period-all').addEventListener('click', () => { window.daytoneSpan = 'all'; show('music'); });
  $v('music-gallery-post').addEventListener('click', openUpload);
  $v('forum-rank-all').addEventListener('click', () => show('forum-all'));
  $v('forum-rank-post').addEventListener('click', openForumPost);
  $v('generic-top').addEventListener('click', () => show('forum'));
  $v('generic-post').addEventListener('click', openForumPost);
  $v('floating-post').addEventListener('click', () => screen === 'music-all' ? openUpload() : openForumPost());
  $v('generic-previous-day').addEventListener('click', () => setForumDay(addDays(day, -1)));
  $v('generic-next-day').addEventListener('click', () => setForumDay(addDays(day, 1)));
  $v('generic-date').addEventListener('change', event => setForumDay(event.target.value));
  $v('generic-post-close').addEventListener('click', () => $v('generic-post-dialog').close());
  $v('generic-post-cancel').addEventListener('click', () => $v('generic-post-dialog').close());
  $v('generic-post-form').addEventListener('submit', event => void publishPost(event));
  $v('generic-discussion-close').addEventListener('click', () => $v('generic-discussion-dialog').close());
  $v('music-discussion-close').addEventListener('click', () => $v('music-discussion-dialog').close());
  $v('music-post').addEventListener('click', openUpload);
  $v('show-top-songs').addEventListener('click', () => show('music'));
  $v('show-all-songs').addEventListener('click', () => show('music-all'));
  window.addEventListener('daytone:songs-loaded', () => { if (screen === 'music') renderMusicGallery(); if (selectedSongId && $v('music-discussion-dialog').open) { const song = songs.find(x => x.id === selectedSongId) || selectedSong; if (song) void openMusicDiscussion(song); } });
  window.addEventListener('daytone:open-music-discussion', event => openMusicDiscussion(event.detail.id));
  window.addEventListener('daytone:profile', () => { $v('welcome-name').textContent = profile?.nickname || user?.user_metadata?.nickname || 'friend'; window.DaytoneMusicRooms?.refreshAccount(); });
  window.addEventListener('daytone:forum-edited',()=>{if(postSpace(screen))void loadPosts();});
  window.addEventListener('daytone:day', event => { day = event.detail.day; monthCursor = day.slice(0, 7); if (screen === 'music') renderMusicGallery(); });
  window.addEventListener('popstate', syncUrl);
  window.DaytoneCommunity = {
    show,
    getDay: () => day,
    getScreen: () => screen,
    setDay(value) { setChosenDay(value); if (screen !== 'welcome') updateRoute(false); },
    openGenre(key) { window.daytoneGenre = key; window.daytoneSpan = 'today'; renderSongs(); show('music'); },
    openGroup(id) { window.daytoneGroupId = id; window.daytoneGroupPeriod = 'today'; show('group'); },
    openMusicDiscussion,
    openForumDiscussion:openDiscussion,
    openHomePostDiscussion,
    renderMusicGallery,
    refresh() { if (screen === 'welcome') renderCalendar(); else if (screen === 'music-hub') window.DaytoneMusicRooms?.renderHub(); else if(screen==='playlists')window.DaytonePlaylists?.render(); else if (screen === 'group') window.DaytoneMusicRooms?.renderGroup(); else if(screen==='music'){renderMusicGallery();if(window.daytoneSpan==='all')void window.DaytoneMusicRooms?.loadAllTimePublic();} }
  };
})();
