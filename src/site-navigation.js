/* The calendar is a usable daily index; the cinematic entrance remains an optional route. */
(() => {
  const app=window.DaytoneCommunity, host=document.getElementById('calendar-day-preview');
  const nav=document.getElementById('site-quick-nav');
  let request=0,period='month',monthCache=null;
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
    const active=key==='welcome'?screen==='welcome':key==='music-hub'?['music-hub','music','music-all','group'].includes(screen):key==='forum-all'?screen.startsWith('forum'):screen===key;
    button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  }}
  function songRow(song,rank,count,day){
    const row=node('article','day-preview-row'),art=node('button','day-preview-art');
    art.type='button';art.title='Listen to '+song.title;art.setAttribute('aria-label','Listen to '+song.title);
    art.addEventListener('click',()=>window.DaytoneListen?.open(song));
    if(song.cover_path){const image=node('img');image.src=publicFile('images',song.cover_path);image.alt='';image.loading='lazy';art.append(image);}else art.textContent='♫';
    const open=node('button','day-preview-open');open.type='button';open.append(node('small','',String(rank).padStart(2,'0')),node('strong','',song.title),node('span','',[song.artist,song.nickname].filter(Boolean).join(' · ')));
    open.addEventListener('click',()=>{app.setDay(day);app.show('music-all');if(songs.some(item=>item.id===song.id))app.openMusicDiscussion(song.id);else window.addEventListener('daytone:songs-loaded',()=>app.openMusicDiscussion(song.id),{once:true});});
    const score=node('span','day-preview-score',String(count)+(count===1?' vote':' votes'));
    const copy=node('button','paper-copy');copy.type='button';copy.title='Copy song title';copy.setAttribute('aria-label','Copy song title');const icon=node('span','paper-copy-icon');icon.setAttribute('aria-hidden','true');copy.append(icon);copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(song.title);toast('Copied: '+song.title);}catch{toast('Select the title to copy it.');}});row.append(art,open,score,copy);return row;
  }
  function renderGallery(host,rows,counts,day){
    host.replaceChildren();const heading=node('div','edition-gallery-head');heading.append(node('div','', ''));
    heading.firstChild.append(node('small','','THE LISTENING GALLERY'),node('h3','','The songs on display'));
    const all=node('button','','Explore the full gallery ↗');all.type='button';all.addEventListener('click',()=>{app.setDay(day);app.show('music');});heading.append(all);host.append(heading);
    if(!rows.length){host.append(node('p','day-preview-empty','The frames are waiting for the first song of the day.'));return;}
    const wall=node('div','edition-gallery-wall');
    rows.slice(0,3).forEach((song,index)=>{
      const card=node('article','edition-gallery-card'+(index===0?' lead':''));
      const scene=node('img','edition-gallery-scene');scene.src=['music-2.png','music-1.png','music-3.png'][index];scene.alt='';scene.loading='lazy';card.append(scene);
      const cover=node('button','edition-gallery-cover');cover.type='button';cover.setAttribute('aria-label','Listen to '+song.title);cover.title='Listen to '+song.title;
      if(song.cover_path){const image=node('img');image.src=publicFile('images',song.cover_path);image.alt='';image.loading='lazy';cover.append(image);}else cover.append(node('span','','♫'));
      cover.addEventListener('click',()=>window.DaytoneListen?.open(song));card.append(cover);
      const caption=node('div','edition-gallery-caption');caption.append(node('small','',String(index+1).padStart(2,'0')+' / '+(counts.get(song.id)||0)+((counts.get(song.id)||0)===1?' vote':' votes')),node('h4','',song.title),node('p','',[song.artist,song.nickname].filter(Boolean).join(' · ')));
      const discuss=node('button','edition-gallery-discuss','Read & discuss ↗');discuss.type='button';discuss.addEventListener('click',()=>{app.setDay(day);app.show('music-all');if(songs.some(item=>item.id===song.id))app.openMusicDiscussion(song.id);else window.addEventListener('daytone:songs-loaded',()=>app.openMusicDiscussion(song.id),{once:true});});caption.append(discuss);card.append(caption);wall.append(card);
    });host.append(wall);
  }
  function roomShelf(){
    const shelf=node('section','room-shelf'),head=node('div','room-shelf-head');
    head.append(node('div','', ''));head.firstChild.append(node('small','','AFTER THE MUSIC'),node('h3','','Choose another page'));
    const controls=node('div','room-shelf-controls'),previous=node('button','','←'),next=node('button','','→');
    previous.type=next.type='button';previous.setAttribute('aria-label','Previous rooms');next.setAttribute('aria-label','Next rooms');controls.append(previous,next);head.append(controls);shelf.append(head);
    const track=node('div','room-shelf-track');track.setAttribute('aria-label','Other sharing rooms');
    const rooms=[['daily-all','01','Daily Life','Small things worth remembering.'],['forum-all','02','Forum','A question, and the replies it brings.'],['film-all','03','Film','A scene that stayed with you.'],['art-all','04','Art','Something worth looking at twice.'],['books-all','05','Books','A book you keep returning to.']];
    for(const [screen,number,name,description] of rooms){const card=node('button','room-shelf-card '+screen);card.type='button';card.append(node('small','',number+' / DAYTONE'),node('strong','',name),node('span','',description),node('em','','Enter ↗'));card.addEventListener('click',()=>app.show(screen));track.append(card);}shelf.append(track);
    previous.addEventListener('click',()=>track.scrollBy({left:-track.clientWidth*.7,behavior:'smooth'}));next.addEventListener('click',()=>track.scrollBy({left:track.clientWidth*.7,behavior:'smooth'}));
    return shelf;
  }
  function previewFrame(day){
    host.replaceChildren();const head=node('div','day-preview-head');
    head.append(node('div','', ''),node('small','',format(day)+' / A DAY TO SHARE'));
    head.firstChild.append(node('p','kicker','ON THE CALENDAR'),node('h2','', 'Music on this day'));
    host.append(head);const grid=node('div','day-preview-grid');
    const music=node('section','day-preview-section day-preview-main'),periodic=node('section','day-preview-section day-preview-periodic');
    music.append(node('h3','','Selected day · Top 5'));const periodHead=node('div','period-head');periodHead.append(node('h3','','Across the dates'));const tabs=node('div','period-tabs');for(const [key,label] of [['month','Month'],['week','Week']]){const button=node('button',period===key?'active':'',label);button.type='button';button.setAttribute('aria-pressed',String(period===key));button.addEventListener('click',()=>{period=key;void render();});tabs.append(button);}periodHead.append(tabs);periodic.append(periodHead);
    grid.append(music,periodic);host.append(grid,roomShelf());const gallery=node('section','edition-gallery'),archive=node('section','month-archive');host.append(gallery,archive);return {music,periodic,gallery,archive};
  }
  function boundaries(day){const date=new Date(day+'T12:00:00Z'),monday=new Date(date);monday.setUTCDate(date.getUTCDate()-((date.getUTCDay()+6)%7));return {start:day.slice(0,7)+'-01',end:new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,1)).toISOString().slice(0,10),weekStart:monday.toISOString().slice(0,10),weekEnd:new Date(monday.getTime()+7*86400000).toISOString().slice(0,10)};}
  async function loadMonth(day){const {start,end}=boundaries(day);if(monthCache?.key===start&&Date.now()-monthCache.at<45000)return monthCache;const songs=await fetchEveryRow(()=>client.from('songs').select('id,day,title,artist,nickname,cover_path,audio_path,source_url,created_at').gte('day',start).lt('day',end).order('day',{ascending:false}).order('created_at',{ascending:false}));const counts=new Map(),voteUsers=new Map();for(let i=0;i<songs.length;i+=100){const votes=await fetchEveryRow(()=>client.from('song_votes').select('song_id,user_id').in('song_id',songs.slice(i,i+100).map(item=>item.id)));for(const vote of votes){counts.set(vote.song_id,(counts.get(vote.song_id)||0)+1);if(!voteUsers.has(vote.song_id))voteUsers.set(vote.song_id,new Set());voteUsers.get(vote.song_id).add(vote.user_id);}}monthCache={key:start,at:Date.now(),songs,counts,voteUsers};return monthCache;}
  function ranked(rows,counts){return [...rows].sort((a,b)=>(counts.get(b.id)||0)-(counts.get(a.id)||0)||b.created_at.localeCompare(a.created_at));}
  function periodRank(rows,counts,voteUsers){const map=new Map();for(const song of rows){const key=(song.title+'|'+(song.artist||'')).normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim(),votes=counts.get(song.id)||0,entry=map.get(key);if(!entry)map.set(key,{song,supporters:new Set(voteUsers.get(song.id)||[])});else{for(const uid of voteUsers.get(song.id)||[])entry.supporters.add(uid);if(votes>(counts.get(entry.song.id)||0))entry.song=song;}}return [...map.values()].map(entry=>({...entry,votes:entry.supporters.size})).sort((a,b)=>b.votes-a.votes||b.song.created_at.localeCompare(a.song.created_at));}
  function renderArchive(host,songs,counts,day){host.replaceChildren();host.append(node('p','kicker','THE MONTH ON PAPER'),node('h3','',new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'))),node('p','period-caption','Every sharing day · open a date to see all its songs.'));const days=new Map();for(const song of songs){if(!days.has(song.day))days.set(song.day,[]);days.get(song.day).push(song);}if(!days.size){host.append(node('p','day-preview-empty','No songs shared this month yet.'));return;}for(const [date,items] of [...days].sort((a,b)=>b[0].localeCompare(a[0]))){const details=node('details','month-day');const summary=node('summary');summary.append(node('span','',format(date)),node('small','',items.length+' '+(items.length===1?'song':'songs')+' ↗'));details.append(summary);const list=node('div','month-day-list');ranked(items,counts).forEach((song,i)=>list.append(songRow(song,i+1,counts.get(song.id)||0,date)));details.append(list);host.append(details);}}
  async function render(){
    const current=++request,day=app.getDay(),{music,periodic,gallery,archive}=previewFrame(day);
    music.append(node('p','day-preview-loading','Loading today’s music…'));periodic.append(node('p','day-preview-loading','Loading the chart…'));archive.append(node('p','day-preview-loading','Opening the month…'));
    if(!client){music.append(node('p','','The shared database is unavailable.'));return;}
    try{
      const {songs,counts,voteUsers}=await loadMonth(day);
      if(current!==request||day!==app.getDay())return;
      music.querySelector('.day-preview-loading')?.remove();periodic.querySelector('.day-preview-loading')?.remove();
      const todayRows=ranked(songs.filter(song=>song.day===day),counts).slice(0,5);
      if(!todayRows.length)music.append(node('p','day-preview-empty','No songs yet. Share the first one.'));
      else todayRows.forEach((song,i)=>music.append(songRow(song,i+1,counts.get(song.id)||0,day)));
      renderGallery(gallery,todayRows,counts,day);
      const musicActions=node('div','day-preview-actions'),allMusic=node('button','','See every song ↗'),share=node('button','','＋ Share a song');
      allMusic.type=share.type='button';allMusic.addEventListener('click',()=>{app.setDay(day);app.show('music-all');});share.addEventListener('click',openUpload);musicActions.append(allMusic,share);music.append(musicActions);
      const {weekStart,weekEnd}=boundaries(day),periodRows=songs.filter(song=>period==='month'||song.day>=weekStart&&song.day<weekEnd),leaders=periodRank(periodRows,counts,voteUsers).slice(0,5);
      periodic.append(node('p','period-caption',period==='month'?'Most supported songs shared this month.':'Most supported songs shared this week.'));
      if(!leaders.length)periodic.append(node('p','day-preview-empty','The chart is waiting for its first song.'));
      else leaders.forEach((item,i)=>periodic.append(songRow(item.song,i+1,item.votes,item.song.day)));
      renderArchive(archive,songs,counts,day);
    }catch(error){if(current!==request)return;music.querySelector('.day-preview-loading')?.remove();periodic.querySelector('.day-preview-loading')?.remove();archive.replaceChildren();music.append(node('p','day-preview-empty','Could not load this month. Please try again.'));}
  }
  window.addEventListener('daytone:calendar-day',()=>void render());
  window.addEventListener('daytone:screen-changed',event=>{navState(event.detail.screen);if(event.detail.screen==='welcome')void render();});
  window.addEventListener('daytone:vote',()=>{monthCache=null;if(app.getScreen()==='welcome')void render();});
  window.addEventListener('daytone:songs-loaded',()=>{monthCache=null;});
  navState(app.getScreen());if(app.getScreen()==='welcome')void render();
})();
