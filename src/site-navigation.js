/* The calendar is a usable daily index; the cinematic entrance remains an optional route. */
(() => {
  const app=window.DaytoneCommunity, host=document.getElementById('calendar-day-preview');
  const nav=document.getElementById('site-quick-nav');
  let request=0,period='month',monthCache=null,activeRoom='music';
  const roomCache=new Map(),roomPending=new Map();
  const rooms=[
    {key:'music',screen:'music-hub',number:'00',name:'Music',line:'Songs and charts.'},
    {key:'film',screen:'film-all',number:'01',name:'Film',line:'Films shared today.'},
    {key:'art',screen:'art-all',number:'02',name:'Art',line:'Art shared today.'},
    {key:'books',screen:'books-all',number:'03',name:'Books',line:'Books shared today.'},
    {key:'daily',screen:'daily-all',number:'04',name:'Daily Life',line:'Notes from today.'},
    {key:'forum',screen:'forum-all',number:'05',name:'Forum',line:'Questions and discussion.'}
  ];
  const layoutKey='daytone-display-mode';
  let layoutMode=localStorage.getItem(layoutKey)==='scenes'?'scenes':'edition';
  function setLayout(mode){
    layoutMode=mode==='scenes'?'scenes':'edition';
    document.body.dataset.layout=layoutMode;
    localStorage.setItem(layoutKey,layoutMode);
    document.querySelectorAll('[data-layout-choice]').forEach(button=>{
      const selected=button.dataset.layoutChoice===layoutMode;
      button.setAttribute('aria-pressed',String(selected));button.classList.toggle('selected',selected);
    });
  }
  document.querySelectorAll('[data-layout-choice]').forEach(button=>button.addEventListener('click',()=>setLayout(button.dataset.layoutChoice)));
  window.DaytoneSiteLayout={get:()=>layoutMode,set:setLayout};
  setLayout(layoutMode);
  const node=(tag,cls,content)=>el(tag,cls,content);
  const format=value=>new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
  function navigate(target){
    if(target==='music-hub')app.show('music-hub');
    else if(target==='playlists')window.DaytonePlaylists?.open();
    else app.show(target);
  }
  nav.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.go)));
  document.getElementById('jump-to-songs')?.addEventListener('click',()=>host.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
  function navState(screen){for(const button of nav.querySelectorAll('[data-go]')){
    const key=button.dataset.go;
    const active=screen===key;
    button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  }}
  function collectionButton(label,action,kind=''){
    const button=node('button','collection-link '+kind);button.type='button';button.textContent=label;
    button.addEventListener('click',action);return button;
  }
  function collectionItem(item){
    const row=node('article','collection-item'),kind=node('small','',item.kind),title=node('strong','',item.title),details=node('span','',item.details);
    const cover=node('button','collection-cover');cover.type='button';cover.title=item.kind==='MUSIC'?(window.DaytoneListen?.actionLabel(item.raw)||'Find '+item.title):'Open '+item.title;
    cover.setAttribute('aria-label',cover.title);const imageUrl=item.cover;
    if(imageUrl){const image=node('img');image.src=imageUrl;image.alt='';image.loading='lazy';cover.append(image);}else cover.textContent=item.kind==='MUSIC'?'♫':'↗';
    const listen=()=>window.DaytoneListen?.open(item.raw);
    const discuss=()=>item.kind==='MUSIC'?discussSong(item.raw,item.raw.day):void app.openHomePostDiscussion(item.raw.id);
    cover.addEventListener('click',item.kind==='MUSIC'?listen:discuss);
    const copy=node('div','collection-item-copy');copy.append(kind,title,details,node('small','collection-item-action',item.kind==='MUSIC'?'Read & discuss ↗':'Open discussion ↗'));copy.addEventListener('click',discuss);copy.tabIndex=0;copy.setAttribute('role','button');copy.setAttribute('aria-label',(item.kind==='MUSIC'?'Discuss ':'Open ')+item.title);copy.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();discuss();}});
    row.append(cover,copy);return row;
  }
  let collectionRequest=0,libraryView='likes',libraryLayout='grid';
  window.DaytoneLibrary={openLikes(){libraryView='likes';if(app.getScreen()==='explore')void renderCollection('explore');else app.show('explore');},openAll(){libraryView='all';if(app.getScreen()==='explore')void renderCollection('explore');else app.show('explore');}};
  async function renderCollection(screen){
    const current=++collectionRequest,following=screen==='following',root=document.getElementById(following?'following-content':'explore-content');
    root.replaceChildren(node('p','collection-status','Loading…'));
    if(!client){root.replaceChildren(node('p','collection-status','The shared collection is unavailable.'));return;}
    try{
      const followed=user?await client.from('user_chart_follows').select('genre').eq('user_id',user.id):{data:[],error:null};
      if(followed.error)throw followed.error;
      const groupResult=following&&user?await client.from('music_groups').select('id,name').order('created_at',{ascending:false}):{data:[],error:null};
      if(groupResult.error)throw groupResult.error;
      const publicSongs=await fetchEveryRow(()=>client.from('songs').select('id,owner_id,day,title,artist,nickname,cover_path,audio_path,source_url,genres,genre,language,created_at').order('created_at',{ascending:false}));
      const publicPosts=following?[]:await fetchEveryRow(()=>client.from('posts').select('id,day,category,title,creator,nickname,image_path,created_at').order('created_at',{ascending:false}));
      if(current!==collectionRequest||app.getScreen()!==screen)return;
      root.replaceChildren();
      if(following){
        const memberResult=user?await client.from('user_follows').select('followed_id').eq('follower_id',user.id):{data:[],error:null};
        if(memberResult.error)throw memberResult.error;
        if(current!==collectionRequest||app.getScreen()!==screen)return;
        const memberIds=new Set((memberResult.data||[]).map(row=>row.followed_id));
        const keys=new Set((followed.data||[]).map(row=>row.genre));
        const intro=node('div','collection-section');intro.append(node('h2','','Your choices'));
        const choices=node('div','collection-categories');
        for(const key of keys)choices.append(collectionButton(musicGenreName(key)+' ↗',()=>app.openGenre(key)));
        for(const group of groupResult.data||[])choices.append(collectionButton(group.name+' · private ↗',()=>app.openGroup(group.id),'private'));
        if(!choices.childElementCount)intro.append(node('p','collection-status',user?'Follow a chart on Home, or join a private group.':'Log in to keep the charts and groups you follow.'));
        else intro.append(choices);
        intro.append(collectionButton('Choose music charts ↗',()=>app.show('music-hub'),'muted'));root.append(intro);
        if(memberIds.size){
          const people=node('div','collection-section');people.append(node('h2','','People you follow'));
          const buttons=node('div','collection-categories');
          for(const id of memberIds){const shared=publicSongs.find(song=>song.owner_id===id);buttons.append(collectionButton('@'+(shared?.nickname||'Member')+' ↗',()=>window.DaytoneSocial?.openProfile(id,shared?.nickname||'')));}
          people.append(buttons);root.append(people);
          const fromPeople=publicSongs.filter(song=>memberIds.has(song.owner_id));
          const feed=node('div','collection-section');feed.append(node('h2','','Shared by people you follow'));
          if(fromPeople.length){const list=node('div','collection-list');for(const song of fromPeople)list.append(collectionItem({kind:'MUSIC',title:song.title,details:[song.artist,song.nickname].filter(Boolean).join(' · '),cover:songCoverUrl(song),raw:song}));feed.append(list);}
          else feed.append(node('p','collection-status','Their new songs will appear here.'));
          root.append(feed);
        }
        const recent=publicSongs.filter(song=>[...keys].some(key=>songInChart(song,key)));
        const section=node('div','collection-section');section.append(node('h2','','New in your charts'));
        if(!recent.length)section.append(node('p','collection-status','New songs from followed charts will appear here.'));
        else {const list=node('div','collection-list');recent.forEach(song=>list.append(collectionItem({kind:'MUSIC',title:song.title,details:[song.artist,song.nickname].filter(Boolean).join(' · '),cover:songCoverUrl(song),raw:song})));section.append(list);}
        root.append(section);
        if(user){
          const ownSongs=await fetchEveryRow(()=>client.from('songs').select('id,day,title,artist,nickname,cover_path,audio_path,source_url,genres,genre,language,created_at,owner_id').eq('owner_id',user.id).order('created_at',{ascending:false}));
          const ownPosts=await fetchEveryRow(()=>client.from('posts').select('id,day,category,title,creator,nickname,image_path,created_at,owner_id').eq('owner_id',user.id).order('created_at',{ascending:false}));
          if(current!==collectionRequest||app.getScreen()!==screen)return;
          const yours=node('div','collection-section');yours.append(node('h2','','Your shares'));
          const items=[...ownSongs.map(song=>({kind:'MUSIC',title:song.title,details:[song.artist,song.day].filter(Boolean).join(' · '),cover:songCoverUrl(song),raw:song,date:song.created_at})),...ownPosts.map(post=>({kind:(post.category||'POST').toUpperCase(),title:post.title,details:[post.creator,post.day].filter(Boolean).join(' · '),cover:post.image_path?publicFile('images',post.image_path):'',raw:post,date:post.created_at}))].sort((a,b)=>b.date.localeCompare(a.date));
          if(items.length){const list=node('div','collection-list');items.forEach(item=>list.append(collectionItem(item)));yours.append(list);}else yours.append(node('p','collection-status','Things you share will appear here.'));
          root.append(yours);
        }
        return;
      }
      const items=[...publicSongs.map(song=>({kind:'MUSIC',title:song.title,details:[song.artist,song.nickname].filter(Boolean).join(' · '),cover:songCoverUrl(song),raw:song,date:song.created_at})),...publicPosts.map(post=>({kind:(post.category||'POST').toUpperCase(),title:post.title,details:[post.creator,post.nickname].filter(Boolean).join(' · '),cover:post.image_path?publicFile('images',post.image_path):'',raw:post,date:post.created_at}))].sort((a,b)=>b.date.localeCompare(a.date));
      const ownVotes=user?await fetchEveryRow(()=>client.from('song_votes').select('song_id').eq('user_id',user.id)) : [];
      if(current!==collectionRequest||app.getScreen()!==screen)return;
      const likedIds=new Set(ownVotes.map(vote=>vote.song_id));
      const latest=node('div','collection-section');
      const tabs=node('div','library-tabs');
      for(const [key,label] of [['likes','♡ Likes'],['all','All shares']]){
        const button=collectionButton(label,()=>{libraryView=key;update();});button.dataset.libraryTab=key;tabs.append(button);
      }
      latest.append(tabs);
      const title=node('h2','',libraryView==='likes'?'Songs you like':'All public shares');latest.append(title);
      const controls=node('div','collection-library-controls'),filters=node('div','collection-categories'),search=node('input','collection-search');
      search.type='search';search.placeholder='Search titles and artists';search.setAttribute('aria-label','Search public shares');
      let selected='ALL';const buttons=[];
      const list=node('div','collection-list library-grid');
      const update=()=>{
        const term=search.value.trim().toLocaleLowerCase();
        const shown=items.filter(item=>(libraryView==='all'||(item.kind==='MUSIC'&&likedIds.has(item.raw.id)))&&(selected==='ALL'||item.kind===selected)&&(!term||[item.title,item.details,item.kind].join(' ').toLocaleLowerCase().includes(term)));
        title.textContent=libraryView==='likes'?'Songs you like':'All public shares';
        filters.hidden=libraryView==='likes';
        tabs.querySelectorAll('[data-library-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.libraryTab===libraryView)));
        list.classList.toggle('library-grid',libraryLayout==='grid');list.classList.toggle('library-list',libraryLayout==='list');
        list.replaceChildren();
        if(!shown.length)list.append(node('p','collection-status',libraryView==='likes'?(user?'Heart a song to keep it here.':'Log in to keep songs you like.'):'No matching shares.'));
        else shown.forEach(item=>list.append(collectionItem(item)));
        buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===selected)));
      };
      for(const [key,label] of [['ALL','All'],['MUSIC','Music'],['FILM','Film'],['ART','Art'],['BOOKS','Books'],['DAILY','Daily Life'],['FORUM','Forum']]){
        const button=collectionButton(label,()=>{selected=key;update();});button.dataset.filter=key;buttons.push(button);filters.append(button);
      }
      filters.append(collectionButton('Playlists ↗',()=>navigate('playlists'),'muted'));
      const layouts=node('div','library-view-controls');
      for(const [key,label] of [['grid','▦'],['list','☷']]){const button=collectionButton(label,()=>{libraryLayout=key;update();});button.title=key==='grid'?'Grid view':'List view';button.setAttribute('aria-label',button.title);layouts.append(button);}
      search.addEventListener('input',update);controls.append(filters,layouts,search);latest.append(controls,list);update();
      root.append(latest);
    }catch(error){console.warn('Collection load failed',JSON.stringify(error));if(current===collectionRequest)root.replaceChildren(node('p','collection-status','Could not load this collection. Please try again.'));}
  }
  function discussSong(song,day){
    if(songs.some(item=>item.id===song.id)){app.openMusicDiscussion(song.id);return;}
    window.addEventListener('daytone:songs-loaded',()=>app.openMusicDiscussion(song.id),{once:true});
    app.setDay(day);app.show('music-all');
  }
  function songRow(song,rank,count,day,voteUsers){
    const row=node('article','day-preview-row'),art=node('button','day-preview-art');
    art.type='button';art.title=window.DaytoneListen?.actionLabel(song)||'Find '+song.title;art.setAttribute('aria-label',art.title);
    art.addEventListener('click',()=>window.DaytoneListen?.open(song));
    const coverUrl=songCoverUrl(song);if(coverUrl){const image=node('img');image.src=coverUrl;image.alt='';image.loading='lazy';art.append(image);}else art.textContent='♫';
    const open=node('button','day-preview-open');open.type='button';open.append(node('small','',String(rank).padStart(2,'0')),node('strong','',song.title),node('span','',[song.artist,song.nickname].filter(Boolean).join(' · ')));
    open.addEventListener('click',()=>window.DaytoneListen?.open(song));
    const actions=node('div','day-preview-row-actions');
    const chosen=Boolean(user&&voteUsers?.get(song.id)?.has(user.id));
    const vote=node('button','day-preview-action day-preview-vote'+(chosen?' chosen':''),(chosen?'♥ ':'♡ ')+count);
    vote.type='button';vote.title=chosen?'Remove your vote':'Support this song';vote.setAttribute('aria-label',(chosen?'Remove your vote for ':'Support ')+song.title);vote.setAttribute('aria-pressed',String(chosen));
    vote.addEventListener('click',()=>void voteForSong(song.id,chosen));
    const discuss=node('button','day-preview-action day-preview-discuss');discuss.type='button';discuss.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v11H9l-5 3v-14Z"/><path d="M8 10.5h8"/></svg>';discuss.title='Discuss '+song.title;discuss.setAttribute('aria-label','Discuss '+song.title);discuss.addEventListener('click',()=>discussSong(song,day));
    const copy=node('button','paper-copy');copy.type='button';copy.title='Copy song title';copy.setAttribute('aria-label','Copy song title');const icon=node('span','paper-copy-icon');icon.setAttribute('aria-hidden','true');copy.append(icon);copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(song.title);toast('Copied: '+song.title);}catch{toast('Select the title to copy it.');}});actions.append(vote,discuss,copy);
    const videoLinks=node('span','day-preview-video-links');
    videoLinks.append(window.DaytoneListen.videoSearchLink('youtube',song),window.DaytoneListen.videoSearchLink('bilibili',song));
    actions.append(videoLinks);
    row.append(art,open,actions);return row;
  }
  function renderGallery(host,rows,counts,day){
    host.replaceChildren();const heading=node('div','edition-gallery-head');heading.append(node('div','', ''));
    heading.firstChild.append(node('small','','MUSIC / TODAY'),node('h3','','Songs on display'));
    const all=node('button','','Explore the full gallery ↗');all.type='button';all.addEventListener('click',()=>{app.setDay(day);app.show('music');});heading.append(all);host.append(heading);
    if(!rows.length){host.append(node('p','day-preview-empty','No songs shared on this date yet.'));return;}
    const wall=node('div','edition-gallery-wall');
    rows.slice(0,3).forEach((song,index)=>{
      const card=node('article','edition-gallery-card'+(index===0?' lead':''));
      const scene=node('img','edition-gallery-scene');scene.src=['music-2.png','music-1.png','music-3.png'][index];scene.alt='';scene.loading='lazy';card.append(scene);
      const cover=node('button','edition-gallery-cover');cover.type='button';cover.setAttribute('aria-label',window.DaytoneListen?.actionLabel(song)||'Find '+song.title);cover.title=cover.getAttribute('aria-label');
      const coverUrl=songCoverUrl(song);if(coverUrl){const image=node('img');image.src=coverUrl;image.alt='';image.loading='lazy';cover.append(image);}else cover.append(node('span','','♫'));
      cover.addEventListener('click',()=>window.DaytoneListen?.open(song));card.append(cover);
      const videoLinks=node('div','edition-gallery-video-links');
      videoLinks.append(window.DaytoneListen.videoSearchLink('youtube',song),window.DaytoneListen.videoSearchLink('bilibili',song));card.append(videoLinks);
      const caption=node('div','edition-gallery-caption');caption.append(node('small','',String(index+1).padStart(2,'0')+' / '+(counts.get(song.id)||0)+((counts.get(song.id)||0)===1?' vote':' votes')),node('h4','',song.title),node('p','',[song.artist,song.nickname].filter(Boolean).join(' · ')));
      const discuss=node('button','edition-gallery-discuss','Discuss ↗');discuss.type='button';discuss.addEventListener('click',()=>discussSong(song,day));caption.append(discuss);card.append(caption);wall.append(card);
    });host.append(wall);
  }
  function selectRoom(key){
    if(!rooms.some(room=>room.key===key)||key===activeRoom)return;
    const direction=rooms.findIndex(room=>room.key===key)>rooms.findIndex(room=>room.key===activeRoom)?'next':'previous';
    const change=()=>{
      activeRoom=key;document.body.dataset.activeRoom=key;
      const jump=document.getElementById('jump-to-songs');if(jump)jump.textContent='See '+rooms.find(room=>room.key===key).name+' ↓';
      const introduction=document.querySelector('.welcome-heading>p:last-of-type');if(introduction)introduction.textContent='Choose a date, then browse what people shared.';
      void render();
    };
    change();
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    host.dataset.roomMotion=direction;
    clearTimeout(selectRoom.motionTimer);
    selectRoom.motionTimer=setTimeout(()=>delete host.dataset.roomMotion,360);
  }
  function stepRoom(direction){const index=rooms.findIndex(room=>room.key===activeRoom);selectRoom(rooms[(index+direction+rooms.length)%rooms.length].key);}
  function roomShelf(){
    const shelf=node('section','room-shelf room-switcher'),head=node('div','room-shelf-head');
    head.append(node('div','', ''));head.firstChild.append(node('small','','DAYTONE / SPACES'),node('h3','','Browse the spaces'),node('span','room-swipe-hint','Swipe left or right over this page to change spaces.'));
    const controls=node('div','room-shelf-controls'),previous=node('button','','←'),next=node('button','','→');
    previous.type=next.type='button';previous.setAttribute('aria-label','Previous room');next.setAttribute('aria-label','Next room');controls.append(previous,next);head.append(controls);shelf.append(head);
    const track=node('div','room-shelf-track');track.setAttribute('aria-label','Choose a room');
    for(const room of rooms){const card=node('button','room-shelf-card '+room.screen+(room.key===activeRoom?' selected':''));card.type='button';card.setAttribute('aria-pressed',String(room.key===activeRoom));card.append(node('small','',room.number+' / DAYTONE'),node('strong','',room.name),node('span','',room.line),node('em','',room.key===activeRoom?'In this room':'Show this room ↗'));card.addEventListener('click',()=>selectRoom(room.key));track.append(card);}shelf.append(track);
    previous.addEventListener('click',()=>stepRoom(-1));next.addEventListener('click',()=>stepRoom(1));
    return shelf;
  }
  function previewFrame(day){
    host.replaceChildren();host.dataset.room=activeRoom;host.append(roomShelf());const head=node('div','day-preview-head');
    head.append(node('div','', ''),node('small','',format(day)+' / A DAY TO SHARE'));
    head.firstChild.append(node('p','kicker','ON THE CALENDAR'),node('h2','', activeRoom==='music'?'Music on this day':rooms.find(room=>room.key===activeRoom).name+' on this day'));
    host.append(head);
    if(activeRoom!=='music'){
      const roomContent=node('section','room-content');host.append(roomContent);return {roomContent};
    }
    const grid=node('div','day-preview-grid');
    const music=node('section','day-preview-section day-preview-main'),periodic=node('section','day-preview-section day-preview-periodic');
    music.append(node('h3','','Top 5 on this date'));const periodHead=node('div','period-head');periodHead.append(node('h3','','Popular songs'));const tabs=node('div','period-tabs');for(const [key,label] of [['month','Month'],['week','Week']]){const button=node('button',period===key?'active':'',label);button.type='button';button.setAttribute('aria-pressed',String(period===key));button.addEventListener('click',()=>{period=key;void render();});tabs.append(button);}periodHead.append(tabs);periodic.append(periodHead);
    grid.append(music,periodic);host.append(grid);const gallery=node('section','edition-gallery'),archive=node('section','month-archive');host.append(gallery,archive);return {music,periodic,gallery,archive};
  }
  function boundaries(day){const date=new Date(day+'T12:00:00Z'),monday=new Date(date);monday.setUTCDate(date.getUTCDate()-((date.getUTCDay()+6)%7));return {start:day.slice(0,7)+'-01',end:new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,1)).toISOString().slice(0,10),weekStart:monday.toISOString().slice(0,10),weekEnd:new Date(monday.getTime()+7*86400000).toISOString().slice(0,10)};}
  async function loadMonth(day){const {start,end}=boundaries(day);if(monthCache?.key===start&&Date.now()-monthCache.at<120000)return monthCache;const songs=await fetchEveryRow(()=>client.from('songs').select('id,day,title,artist,nickname,cover_path,audio_path,source_url,created_at').gte('day',start).lt('day',end).order('day',{ascending:false}).order('created_at',{ascending:false}));const counts=new Map(),voteUsers=new Map();for(let i=0;i<songs.length;i+=100){const votes=await fetchEveryRow(()=>client.from('song_votes').select('song_id,user_id').in('song_id',songs.slice(i,i+100).map(item=>item.id)));for(const vote of votes){counts.set(vote.song_id,(counts.get(vote.song_id)||0)+1);if(!voteUsers.has(vote.song_id))voteUsers.set(vote.song_id,new Set());voteUsers.get(vote.song_id).add(vote.user_id);}}monthCache={key:start,at:Date.now(),songs,counts,voteUsers};return monthCache;}
  function ranked(rows,counts){return [...rows].sort((a,b)=>(counts.get(b.id)||0)-(counts.get(a.id)||0)||b.created_at.localeCompare(a.created_at));}
  function periodRank(rows,counts,voteUsers){const map=new Map();for(const song of rows){const key=(song.title+'|'+(song.artist||'')).normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim(),votes=counts.get(song.id)||0,entry=map.get(key);if(!entry)map.set(key,{song,supporters:new Set(voteUsers.get(song.id)||[])});else{for(const uid of voteUsers.get(song.id)||[])entry.supporters.add(uid);if(votes>(counts.get(entry.song.id)||0))entry.song=song;}}return [...map.values()].map(entry=>({...entry,votes:entry.supporters.size})).sort((a,b)=>b.votes-a.votes||b.song.created_at.localeCompare(a.song.created_at));}
  function renderArchive(host,songs,counts,voteUsers,day){host.replaceChildren();host.append(node('p','kicker','MUSIC / ARCHIVE'),node('h3','',new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'))),node('p','period-caption','Open a date to see the songs shared that day.'));const days=new Map();for(const song of songs){if(!days.has(song.day))days.set(song.day,[]);days.get(song.day).push(song);}if(!days.size){host.append(node('p','day-preview-empty','No songs shared this month yet.'));return;}for(const [date,items] of [...days].sort((a,b)=>b[0].localeCompare(a[0]))){const details=node('details','month-day');const summary=node('summary');summary.append(node('span','',format(date)),node('small','',items.length+' '+(items.length===1?'song':'songs')+' ↗'));details.append(summary);const list=node('div','month-day-list');ranked(items,counts).forEach((song,i)=>list.append(songRow(song,i+1,counts.get(song.id)||0,date,voteUsers)));details.append(list);host.append(details);}}
  function getRoomPosts(room,day){
    const key=room+'|'+day,cached=roomCache.get(key);
    if(cached&&Date.now()-cached.at<90000)return Promise.resolve(cached.rows);
    if(roomPending.has(key))return roomPending.get(key);
    const pending=fetchEveryRow(()=>client.from('posts').select('id,day,category,title,creator,body,nickname,image_path,created_at').eq('category',room).eq('day',day).order('created_at',{ascending:false}))
      .then(rows=>{roomCache.set(key,{rows,at:Date.now()});return rows;}).finally(()=>roomPending.delete(key));
    roomPending.set(key,pending);return pending;
  }
  async function renderRoomContent(host,day,room,current){
    const title=rooms.find(item=>item.key===room).name;
    const cached=roomCache.get(room+'|'+day);
    if(!cached)host.append(node('p','day-preview-loading','Loading '+title+'…'));
    try{
      const posts=cached&&Date.now()-cached.at<90000?cached.rows:await getRoomPosts(room,day);
      if(current!==request||room!==activeRoom||day!==app.getDay())return;
      host.replaceChildren();
      const intro=node('div','room-content-intro');intro.append(node('p','kicker',room==='forum'?'FORUM / DISCUSSION':title.toUpperCase()+' / SHARED'),node('h3','',room==='forum'?'Discussions on this date':title+' on this date'),node('p','',rooms.find(item=>item.key===room).line));host.append(intro);
      if(!posts.length)host.append(node('p','day-preview-empty','No posts here for this date yet.'));
      const list=node('div','room-content-list');posts.forEach(post=>{
        const card=node('article','room-content-card'),open=node('button','room-content-open');open.type='button';open.setAttribute('aria-label','Open '+post.title);
        if(post.image_path){const image=node('img','room-content-image');image.src=publicFile('images',post.image_path);image.alt='';image.loading='lazy';open.append(image);}
        const copy=node('div','room-content-copy');copy.append(node('small','',new Date(post.created_at).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})+' / @'+post.nickname),node('h4','',post.title));if(post.creator)copy.append(node('p','',post.creator));if(post.body)copy.append(node('p','',post.body.length>180?post.body.slice(0,180)+'…':post.body));open.append(copy);open.addEventListener('click',()=>void app.openHomePostDiscussion(post.id));card.append(open);list.append(card);
      });host.append(list);
      const actions=node('div','day-preview-actions'),all=node('button','','Open '+title+' ↗'),post=node('button','','＋ Share in '+title);all.type=post.type='button';all.addEventListener('click',()=>{app.setDay(day);app.show(room==='forum'?'forum-all':room+'-all');});post.addEventListener('click',()=>{app.show(room==='forum'?'forum-all':room+'-all');document.getElementById('generic-post')?.click();});actions.append(all,post);host.append(actions);
      const next=rooms[(rooms.findIndex(item=>item.key===room)+1)%rooms.length];if(next.key!=='music')setTimeout(()=>{if(client)void getRoomPosts(next.key,day).catch(()=>{});},250);
    }catch(error){if(current!==request)return;host.replaceChildren(node('p','day-preview-empty','Could not load '+title+'. Please try again.'));}
  }
  async function render(){
    const current=++request,day=app.getDay(),{music,periodic,gallery,archive,roomContent}=previewFrame(day);
    if(roomContent){if(client)void renderRoomContent(roomContent,day,activeRoom,current);else roomContent.append(node('p','day-preview-empty','The shared database is unavailable.'));return;}
    music.append(node('p','day-preview-loading','Loading today’s music…'));periodic.append(node('p','day-preview-loading','Loading the chart…'));archive.append(node('p','day-preview-loading','Opening the month…'));
    if(!client){music.append(node('p','','The shared database is unavailable.'));return;}
    try{
      const {songs,counts,voteUsers}=await loadMonth(day);
      if(current!==request||day!==app.getDay())return;
      music.querySelector('.day-preview-loading')?.remove();periodic.querySelector('.day-preview-loading')?.remove();
      const todayRows=ranked(songs.filter(song=>song.day===day),counts).slice(0,5);
      if(!todayRows.length)music.append(node('p','day-preview-empty','No songs yet. Share the first one.'));
      else todayRows.forEach((song,i)=>music.append(songRow(song,i+1,counts.get(song.id)||0,day,voteUsers)));
      renderGallery(gallery,todayRows,counts,day);
      const musicActions=node('div','day-preview-actions'),allMusic=node('button','','See every song ↗'),share=node('button','','＋ Share a song');
      allMusic.type=share.type='button';allMusic.addEventListener('click',()=>{app.setDay(day);app.show('music-all');});share.addEventListener('click',openUpload);musicActions.append(allMusic,share);music.append(musicActions);
      const {weekStart,weekEnd}=boundaries(day),periodRows=songs.filter(song=>period==='month'||song.day>=weekStart&&song.day<weekEnd),leaders=periodRank(periodRows,counts,voteUsers).slice(0,5);
      periodic.append(node('p','period-caption',period==='month'?'Most supported songs shared this month.':'Most supported songs shared this week.'));
      if(!leaders.length)periodic.append(node('p','day-preview-empty','The chart is waiting for its first song.'));
      else leaders.forEach((item,i)=>periodic.append(songRow(item.song,i+1,counts.get(item.song.id)||0,item.song.day,voteUsers)));
      renderArchive(archive,songs,counts,voteUsers,day);
      setTimeout(()=>{if(client)void getRoomPosts('film',day).catch(()=>{});},300);
    }catch(error){if(current!==request)return;music.querySelector('.day-preview-loading')?.remove();periodic.querySelector('.day-preview-loading')?.remove();archive.replaceChildren();music.append(node('p','day-preview-empty','Could not load this month. Please try again.'));}
  }
  window.addEventListener('daytone:calendar-day',()=>void render());
  window.addEventListener('daytone:screen-changed',event=>{navState(event.detail.screen);if(event.detail.screen==='welcome')void render();else if(['following','explore'].includes(event.detail.screen))void renderCollection(event.detail.screen);else roomCache.clear();});
  window.addEventListener('daytone:vote',()=>{monthCache=null;if(app.getScreen()==='welcome')void render();});
  window.addEventListener('daytone:songs-loaded',()=>{monthCache=null;});
  let gestureAmount=0,gestureTimer=0,gestureLockedUntil=0;
  const gestureSurface=document.getElementById('welcome');
  const gestureExcluded='input,select,textarea,summary,dialog,.room-shelf-track,.calendar-follow-controls,[contenteditable],audio,video,iframe';
  gestureSurface.addEventListener('wheel',event=>{
    if(app.getScreen()!=='welcome'||event.ctrlKey||event.metaKey||event.shiftKey||!(event.target instanceof Element)||event.target.closest(gestureExcluded))return;
    // Only a deliberate two-finger horizontal gesture over the daily spread changes spaces.
    // Leave vertical scrolling and the category strip to the browser.
    const x=event.deltaX*(event.deltaMode===1?16:1),y=event.deltaY*(event.deltaMode===1?16:1);
    if(Math.abs(x)<8||Math.abs(x)<Math.abs(y)*1.6){gestureAmount=0;return;}
    event.preventDefault();
    if(Date.now()<gestureLockedUntil)return;
    gestureAmount+=x;clearTimeout(gestureTimer);
    gestureTimer=setTimeout(()=>gestureAmount=0,220);
    if(Math.abs(gestureAmount)<90)return;
    const direction=gestureAmount<0?1:-1;gestureAmount=0;gestureLockedUntil=Date.now()+760;
    stepRoom(direction);
  },{passive:false});
  let touchStart=null;
  gestureSurface.addEventListener('touchstart',event=>{const touch=event.touches[0];touchStart=touch&&event.target instanceof Element&&!event.target.closest(gestureExcluded)?{x:touch.clientX,y:touch.clientY}:null;},{passive:true});
  gestureSurface.addEventListener('touchend',event=>{if(!touchStart||app.getScreen()!=='welcome')return;const touch=event.changedTouches[0],dx=touch.clientX-touchStart.x,dy=touch.clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>110&&Math.abs(dx)>Math.abs(dy)*1.6)stepRoom(dx>0?1:-1);},{passive:true});
  document.body.dataset.activeRoom=activeRoom;
  navState(app.getScreen());if(app.getScreen()==='welcome')void render();else if(['following','explore'].includes(app.getScreen()))void renderCollection(app.getScreen());
})();
