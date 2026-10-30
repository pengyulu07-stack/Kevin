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
    const row=node('article','day-preview-row'),art=node('span','day-preview-art');
    if(song.cover_path){const image=node('img');image.src=publicFile('images',song.cover_path);image.alt='';image.loading='lazy';art.append(image);}else art.textContent='♫';
    const open=node('button','day-preview-open');open.type='button';open.append(node('small','',String(rank).padStart(2,'0')),node('strong','',song.title),node('span','',[song.artist,song.nickname].filter(Boolean).join(' · ')));
    open.addEventListener('click',()=>{app.setDay(day);app.show('music-all');if(songs.some(item=>item.id===song.id))app.openMusicDiscussion(song.id);else window.addEventListener('daytone:songs-loaded',()=>app.openMusicDiscussion(song.id),{once:true});});
    const score=node('span','day-preview-score',String(count)+(count===1?' vote':' votes'));
    const copy=node('button','paper-copy');copy.type='button';copy.title='Copy song title';copy.setAttribute('aria-label','Copy song title');const icon=node('span','paper-copy-icon');icon.setAttribute('aria-hidden','true');copy.append(icon);copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(song.title);toast('Copied: '+song.title);}catch{toast('Select the title to copy it.');}});row.append(art,open,score,copy);return row;
  }
  function previewFrame(day){
    host.replaceChildren();const head=node('div','day-preview-head');
    head.append(node('div','', ''),node('small','',format(day)+' / A DAY TO SHARE'));
    head.firstChild.append(node('p','kicker','ON THE CALENDAR'),node('h2','', 'Music on this day'));
    host.append(head);const grid=node('div','day-preview-grid');
    const music=node('section','day-preview-section day-preview-main'),periodic=node('section','day-preview-section day-preview-periodic');
    music.append(node('h3','','Selected day · Top 5'));const periodHead=node('div','period-head');periodHead.append(node('h3','','Across the dates'));const tabs=node('div','period-tabs');for(const [key,label] of [['month','Month'],['week','Week']]){const button=node('button',period===key?'active':'',label);button.type='button';button.setAttribute('aria-pressed',String(period===key));button.addEventListener('click',()=>{period=key;void render();});tabs.append(button);}periodHead.append(tabs);periodic.append(periodHead);
    grid.append(music,periodic);host.append(grid);const archive=node('section','month-archive'),forum=node('section','forum-after-music');host.append(archive,forum);return {music,periodic,archive,forum};
  }
  function boundaries(day){const date=new Date(day+'T12:00:00Z'),monday=new Date(date);monday.setUTCDate(date.getUTCDate()-((date.getUTCDay()+6)%7));return {start:day.slice(0,7)+'-01',end:new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,1)).toISOString().slice(0,10),weekStart:monday.toISOString().slice(0,10),weekEnd:new Date(monday.getTime()+7*86400000).toISOString().slice(0,10)};}
  async function loadMonth(day){const {start,end}=boundaries(day);if(monthCache?.key===start&&Date.now()-monthCache.at<45000)return monthCache;const songs=await fetchEveryRow(()=>client.from('songs').select('id,day,title,artist,nickname,cover_path,created_at').gte('day',start).lt('day',end).order('day',{ascending:false}).order('created_at',{ascending:false}));const counts=new Map(),voteUsers=new Map();for(let i=0;i<songs.length;i+=100){const votes=await fetchEveryRow(()=>client.from('song_votes').select('song_id,user_id').in('song_id',songs.slice(i,i+100).map(item=>item.id)));for(const vote of votes){counts.set(vote.song_id,(counts.get(vote.song_id)||0)+1);if(!voteUsers.has(vote.song_id))voteUsers.set(vote.song_id,new Set());voteUsers.get(vote.song_id).add(vote.user_id);}}monthCache={key:start,at:Date.now(),songs,counts,voteUsers};return monthCache;}
  function ranked(rows,counts){return [...rows].sort((a,b)=>(counts.get(b.id)||0)-(counts.get(a.id)||0)||b.created_at.localeCompare(a.created_at));}
  function periodRank(rows,counts,voteUsers){const map=new Map();for(const song of rows){const key=(song.title+'|'+(song.artist||'')).normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim(),votes=counts.get(song.id)||0,entry=map.get(key);if(!entry)map.set(key,{song,supporters:new Set(voteUsers.get(song.id)||[])});else{for(const uid of voteUsers.get(song.id)||[])entry.supporters.add(uid);if(votes>(counts.get(entry.song.id)||0))entry.song=song;}}return [...map.values()].map(entry=>({...entry,votes:entry.supporters.size})).sort((a,b)=>b.votes-a.votes||b.song.created_at.localeCompare(a.song.created_at));}
  function renderArchive(host,songs,counts,day){host.replaceChildren();host.append(node('p','kicker','THE MONTH ON PAPER'),node('h3','',new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'))),node('p','period-caption','Every sharing day · open a date to see all its songs.'));const days=new Map();for(const song of songs){if(!days.has(song.day))days.set(song.day,[]);days.get(song.day).push(song);}if(!days.size){host.append(node('p','day-preview-empty','No songs shared this month yet.'));return;}for(const [date,items] of [...days].sort((a,b)=>b[0].localeCompare(a[0]))){const details=node('details','month-day');details.open=date===day;const summary=node('summary');summary.append(node('span','',format(date)),node('small','',items.length+' '+(items.length===1?'song':'songs')+' ↗'));details.append(summary);const list=node('div','month-day-list');ranked(items,counts).forEach((song,i)=>list.append(songRow(song,i+1,counts.get(song.id)||0,date)));details.append(list);host.append(details);}}
  async function render(){
    const current=++request,day=app.getDay(),{music,periodic,archive,forum}=previewFrame(day);
    music.append(node('p','day-preview-loading','Loading today’s music…'));periodic.append(node('p','day-preview-loading','Loading the chart…'));archive.append(node('p','day-preview-loading','Opening the month…'));
    if(!client){music.append(node('p','','The shared database is unavailable.'));return;}
    try{
      const [month,forumResult]=await Promise.all([
        loadMonth(day),
        client.from('posts').select('id,title,nickname,post_type,created_at').eq('category','forum').eq('day',day).order('created_at',{ascending:false}).limit(2)
      ]);
      if(forumResult.error)throw forumResult.error;
      const {songs,counts,voteUsers}=month,forums=forumResult.data||[];
      if(current!==request||day!==app.getDay())return;
      music.querySelector('.day-preview-loading')?.remove();periodic.querySelector('.day-preview-loading')?.remove();
      const todayRows=ranked(songs.filter(song=>song.day===day),counts).slice(0,5);
      if(!todayRows.length)music.append(node('p','day-preview-empty','No songs yet. Share the first one.'));
      else todayRows.forEach((song,i)=>music.append(songRow(song,i+1,counts.get(song.id)||0,day)));
      const musicActions=node('div','day-preview-actions'),allMusic=node('button','','See every song ↗'),share=node('button','','＋ Share a song');
      allMusic.type=share.type='button';allMusic.addEventListener('click',()=>{app.setDay(day);app.show('music-all');});share.addEventListener('click',openUpload);musicActions.append(allMusic,share);music.append(musicActions);
      const {weekStart,weekEnd}=boundaries(day),periodRows=songs.filter(song=>period==='month'||song.day>=weekStart&&song.day<weekEnd),leaders=periodRank(periodRows,counts,voteUsers).slice(0,5);
      periodic.append(node('p','period-caption',period==='month'?'Most supported songs shared this month.':'Most supported songs shared this week.'));
      if(!leaders.length)periodic.append(node('p','day-preview-empty','The chart is waiting for its first song.'));
      else leaders.forEach((item,i)=>periodic.append(songRow(item.song,i+1,item.votes,item.song.day)));
      renderArchive(archive,songs,counts,day);
      const forumHead=node('div','forum-after-head');forumHead.append(node('h3','','Conversations'));forum.append(forumHead);
      if(!forums.length)forum.append(node('p','day-preview-empty','No conversations yet. Start one.'));
      else for(const post of forums){const button=node('button','day-preview-forum');button.type='button';button.append(node('small','',post.post_type||'Discussion'),node('strong','',post.title),node('span','','@'+post.nickname));button.addEventListener('click',()=>{app.setDay(day);app.show('forum-all');window.addEventListener('daytone:forums-loaded',()=>app.openForumDiscussion(post.id),{once:true});});forum.append(button);}
      const forumActions=node('div','day-preview-actions'),allForum=node('button','','See the forum ↗'),start=node('button','','＋ Start a forum');
      allForum.type=start.type='button';allForum.addEventListener('click',()=>{app.setDay(day);app.show('forum-all');});start.addEventListener('click',()=>{app.show('forum');document.getElementById('forum-rank-post').click();});forumActions.append(allForum,start);forum.append(forumActions);
    }catch(error){if(current!==request)return;music.querySelector('.day-preview-loading')?.remove();periodic.querySelector('.day-preview-loading')?.remove();archive.replaceChildren();music.append(node('p','day-preview-empty','Could not load this month. Please try again.'));}
  }
  window.addEventListener('daytone:calendar-day',()=>void render());
  window.addEventListener('daytone:screen-changed',event=>{navState(event.detail.screen);if(event.detail.screen==='welcome')void render();});
  window.addEventListener('daytone:vote',()=>{monthCache=null;if(app.getScreen()==='welcome')void render();});
  window.addEventListener('daytone:songs-loaded',()=>{monthCache=null;});
  navState(app.getScreen());if(app.getScreen()==='welcome')void render();
})();
