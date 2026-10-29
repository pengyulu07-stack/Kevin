/* Music charts and private listening groups. UI copy remains English. */
(() => {
  const $r = id => document.getElementById(id);
  const app = window.DaytoneCommunity;
  const palettes = {
    pop: ['#ba5d61','#fff0e8'], rock: ['#3b3432','#dfb58c'], hiphop: ['#4c3025','#ecb86b'],
    electronic: ['#173c4f','#a9e5db'], rnb: ['#5b334c','#ebc4c4'], jazz: ['#352d45','#cfaa65'],
    classical: ['#60634e','#f1e7cf'], soundtrack: ['#26394d','#d7dee2'], chinese: ['#80352b','#f1d5ae'],
    instrumental: ['#4b665f','#e5e7d6'], folk: ['#86664f','#f6dfbc'], kpop: ['#6d4770','#f6dceb'],
    indie: ['#506356','#e9dab7'], other: ['#64352e','#f4e6ce']
  };
  const groupThemes = [
    ['#4b1e24','#e3c9a8','#c89b68'], ['#193c45','#d2e1d7','#9cb8af'],
    ['#3e344f','#e5d7df','#b4a1be'], ['#69543d','#f0e3c9','#cbaa77'],
    ['#355046','#e4e1cd','#9ab39e'], ['#37333a','#dfd4c9','#b8a497']
  ];
  const groupFonts = ["Didot,'Bodoni 72',Georgia,serif","Georgia,'Times New Roman',serif","'Palatino Linotype',Palatino,Georgia,serif"];
  let follows = [], groups = [], activeGroup = null, groupSongs = [];
  let groupReactions = new Map(), groupComments = new Map(), artworkIdeas = [];
  let chartRequest = 0, groupRequest = 0, blobCache = new Map();
  let publicAllTime = [], publicAllTimeGenre = '', publicAllTimeRequest = 0, groupAllTime = [];
  const formatDay = value => new Intl.DateTimeFormat('en-US', { year:'numeric',month:'long',day:'numeric',timeZone:'UTC' }).format(new Date(value + 'T12:00:00Z'));
  const copySymbol = () => { const icon = el('span','paper-copy-icon'); icon.setAttribute('aria-hidden','true'); return icon; };
  function smallCopy(value, label = 'Copy song title') {
    const button = el('button','paper-copy'); button.type='button'; button.setAttribute('aria-label',label); button.title=label; button.append(copySymbol());
    button.addEventListener('click', async event => { event.stopPropagation(); try { await navigator.clipboard.writeText(value); toast('Copied: ' + value); } catch { toast('Select the text to copy it.'); } }); return button;
  }
  const hasGenre = (song,key) => (song.genres || [song.genre || 'other']).includes(key);
  const support = (song,map) => (map.get(song.id)||[]).filter(x => x.emoji==='👍'||x.emoji==='❤️').length;
  async function refreshAccount() {
    if(!user){for(const url of blobCache.values())URL.revokeObjectURL(url);blobCache.clear();groupSongs=[];groupAllTime=[];groupReactions.clear();groupComments.clear();$r('group-top-three').replaceChildren();$r('group-song-list').replaceChildren();}
    await Promise.all([loadFollows(),loadGroups()]); renderFollowControls(); renderCalendarCharts(); if(app.getScreen()==='music-hub') renderHub(); if(app.getScreen()==='group') renderGroup();
  }
  function allTimePublicSongs(){return publicAllTimeGenre===window.daytoneGenre?publicAllTime:[];}
  async function loadAllTimePublic(){
    const genre=window.daytoneGenre,request=++publicAllTimeRequest;
    publicAllTimeGenre=genre;publicAllTime=[];app.renderMusicGallery();
    const {data,error}=await client.rpc('music_alltime_top',{p_genre:genre==='all'?null:genre});
    if(request!==publicAllTimeRequest||genre!==window.daytoneGenre)return;
    if(error){toast('Could not load the all-time chart.');return;}
    publicAllTime=(data||[]).map(row=>({...row.song,supporters:Number(row.supporters)}));app.renderMusicGallery();
  }
  async function loadFollows() {
    if (!client || !user) { follows=[]; return; }
    const {data,error}=await client.from('user_chart_follows').select('slot,genre').eq('user_id',user.id).order('slot');
    if(error){toast('Could not load followed charts.');return;} follows=data||[];
  }
  async function loadGroups() {
    if (!client || !user) { groups=[]; activeGroup=null; return; }
    const {data,error}=await client.from('music_groups').select('id,owner_id,name,code,theme_index,font_index,room_path,top1_path,top2_path,top3_path,created_at').order('created_at',{ascending:false});
    if(error){toast('Could not load private groups.');return;} groups=data||[];
    if(activeGroup) activeGroup=groups.find(x=>x.id===activeGroup.id)||null;
  }
  function renderFollowControls() {
    const host=$r('calendar-follow-controls'); host.replaceChildren();
    const top=el('div','follow-controls-head'); top.append(el('div','', 'FOLLOW TWO CHARTS'),el('p','', 'Pick up to two music charts. Their daily leaders appear beside your calendar.')); host.append(top);
    const grid=el('div','follow-controls-grid');
    for(const [key,label] of musicGenres){
      const chosen=follows.some(x=>x.genre===key),button=el('button','follow-chip'+(chosen?' chosen':''),label);
      button.type='button';button.setAttribute('aria-pressed',String(chosen));button.addEventListener('click',()=>void toggleFollow(key));grid.append(button);
    }
    host.append(grid);
    host.append(el('small','follow-note',user ? follows.length+'/2 charts followed' : 'Sign in to keep your choices across devices.'));
  }
  async function toggleFollow(key) {
    if(!requireAccount())return;
    const prior=follows.find(x=>x.genre===key);
    if(prior){const {error}=await client.from('user_chart_follows').delete().eq('user_id',user.id).eq('genre',key);if(error){toast(error.message);return;}}
    else {const slot=[1,2].find(n=>!follows.some(x=>x.slot===n));if(!slot){toast('You can follow up to two charts.');return;}
      const {error}=await client.from('user_chart_follows').insert({user_id:user.id,slot,genre:key});if(error){toast(error.message);return;}}
    await loadFollows();renderFollowControls();renderCalendarCharts();if(app.getScreen()==='music-hub')renderHub();
  }
  function placeholderRail(host,label) { host.replaceChildren(); const card=el('div','follow-rail-empty');card.append(el('small','',label),el('p','',user?'Follow a chart below to see its daily songs.':'Your followed charts will appear here.'));host.append(card); }
  async function renderCalendarCharts() {
    const left=$r('follow-chart-left'),right=$r('follow-chart-right');
    if(!follows.length){placeholderRail(left,'YOUR CHART / 01');placeholderRail(right,'YOUR CHART / 02');return;}
    const request=++chartRequest,day=app.getDay();
    placeholderRail(left,'LOADING / 01');placeholderRail(right,'LOADING / 02');
    try {
      const {data,error}=await client.from('songs').select('id,title,nickname,genre,genres,created_at').eq('day',day).order('created_at',{ascending:false}).limit(500);
      if(error)throw error;const rows=data||[],ids=rows.map(x=>x.id);let reactionsForDay=[];
      for(let i=0;i<ids.length;i+=100){const result=await client.from('reactions').select('song_id,emoji').in('song_id',ids.slice(i,i+100));if(result.error)throw result.error;reactionsForDay.push(...(result.data||[]));}
      if(request!==chartRequest || day!==app.getDay())return;
      const counts=new Map();for(const row of reactionsForDay)if(row.emoji==='👍'||row.emoji==='❤️')counts.set(row.song_id,(counts.get(row.song_id)||0)+1);
      for(let i=0;i<2;i++){
        const host=i===0?left:right,item=follows.find(x=>x.slot===i+1);if(!item){placeholderRail(host,'YOUR CHART / 0'+(i+1));continue;}
        host.replaceChildren();const head=el('button','follow-rail-title',musicGenreName(item.genre)+' ↗');head.type='button';head.addEventListener('click',()=>app.openGenre(item.genre));host.append(el('small','follow-rail-kicker','FOLLOWING / 0'+(i+1)),head);
        const matches=rows.filter(x=>hasGenre(x,item.genre)).sort((a,b)=>(counts.get(b.id)||0)-(counts.get(a.id)||0)||b.created_at.localeCompare(a.created_at)).slice(0,3);
        if(!matches.length){host.append(el('p','follow-rail-none','No songs here on '+formatDay(day)+' yet.'));continue;}
        for(let n=0;n<matches.length;n++){const song=matches[n],line=el('div','follow-rail-row'),open=el('button','follow-rail-open');open.type='button';open.append(el('small','',String(n+1).padStart(2,'0')),el('strong','',song.title),el('span','', '@'+song.nickname));open.addEventListener('click',()=>app.openGenre(item.genre));line.append(open,smallCopy(song.title));host.append(line);}
      }
    } catch(error){if(request===chartRequest){placeholderRail(left,'YOUR CHART / 01');placeholderRail(right,'YOUR CHART / 02');}}
  }
  function categoryCard(key,label,kind='category') {
    const button=el('button','hub-category-card '+kind);button.type='button';button.style.setProperty('--card-ink',(palettes[key]||palettes.other)[0]);button.style.setProperty('--card-paper',(palettes[key]||palettes.other)[1]);
    button.append(el('small','',kind==='followed'?'FOLLOWING':'MUSIC / CHART'),el('strong','',label),el('span','', 'Enter chart ↗'));
    button.addEventListener('click',()=>app.openGenre(key));return button;
  }
  function renderHub() {
    $r('music-hub-date').textContent=formatDay(app.getDay())+' / CHOOSE A CHART';
    const total=$r('music-hub-total');total.replaceChildren();const all=el('button','hub-total-card');all.type='button';all.append(el('small','','01 / THE PUBLIC CHART'),el('strong','','All Music'),el('span','','Every public song, one daily Top 5 ↗'));all.addEventListener('click',()=>app.openGenre('all'));total.append(all);
    const followHost=$r('music-hub-follows');followHost.replaceChildren();if(follows.length){followHost.append(el('h2','','Following'));const grid=el('div','hub-card-grid');for(const item of follows)grid.append(categoryCard(item.genre,musicGenreName(item.genre),'followed'));followHost.append(grid);}
    const groupHost=$r('music-hub-groups');groupHost.replaceChildren();if(groups.length){groupHost.append(el('h2','','Your private groups'));const grid=el('div','hub-card-grid');for(const group of groups){const button=el('button','hub-group-card');button.type='button';const [ink,paper]=groupThemes[group.theme_index]||groupThemes[0];button.style.setProperty('--card-ink',ink);button.style.setProperty('--card-paper',paper);button.append(el('small','','PRIVATE / MEMBERS ONLY'),el('strong','',group.name),el('span','','Enter group ↗'));button.addEventListener('click',()=>app.openGroup(group.id));grid.append(button);}groupHost.append(grid);}
    const categoryHost=$r('music-hub-category-grid');categoryHost.replaceChildren();for(const [key,label] of musicGenres)categoryHost.append(categoryCard(key,label));
  }
  function openFeedback(){if(!requireAccount())return;$r('feedback-error').textContent='';showDialog('feedback-dialog');}
  async function sendFeedback(event){event.preventDefault();if(!requireAccount())return;const form=$r('feedback-form'),message=form.elements.message.value.trim(),day=today();if(message.length<3){$r('feedback-error').textContent='Write a little more about your idea.';return;}
    const button=$r('feedback-submit');button.disabled=true;try{const used=await client.from('feedback').select('daily_slot').eq('user_id',user.id).eq('day',day);if(used.error)throw used.error;const slots=new Set((used.data||[]).map(x=>x.daily_slot));let saved=false;for(const slot of [1,2,3]){if(slots.has(slot))continue;const result=await client.from('feedback').insert({user_id:user.id,day,daily_slot:slot,message});if(!result.error){saved=true;break;}if(result.error.code!=='23505')throw result.error;}if(!saved)throw Error('You have sent three notes today. Thank you.');form.reset();$r('feedback-dialog').close();toast('Thank you. Your feedback was sent.');}
    catch(error){$r('feedback-error').textContent=error.message||'Could not send feedback.';}finally{button.disabled=false;}}

  async function privateObjectUrl(path) {
    if(!path)return null;if(blobCache.has(path))return blobCache.get(path);
    const {data,error}=await client.storage.from('group-media').download(path);
    if(error)throw error;const url=URL.createObjectURL(data);blobCache.set(path,url);return url;
  }
  async function setPrivateMedia(node,path) { if(!path)return;try{const url=await privateObjectUrl(path);if(node.isConnected)node.src=url;}catch{node.alt='Private image unavailable';} }
  function groupSongScore(song){return window.daytoneGroupPeriod==='all'?Number(song.supporters||0):support(song,groupReactions);}
  function rankedGroupSongs(){return window.daytoneGroupPeriod==='all'?groupAllTime:[...groupSongs].sort((a,b)=>groupSongScore(b)-groupSongScore(a)||b.created_at.localeCompare(a.created_at)||a.id.localeCompare(b.id));}
  async function renderGroup() {
    if(!user){$r('group-screen-title').textContent='A private listening room';$r('group-board-title').textContent='Sign in to open this room';$r('group-top-three').replaceChildren();$r('group-song-list').replaceChildren();return;}
    const groupId=window.daytoneGroupId;
    activeGroup=groups.find(x=>x.id===groupId)||null;
    if(!activeGroup){await loadGroups();activeGroup=groups.find(x=>x.id===groupId)||null;}
    if(!activeGroup){toast('This group is private. Join it with a code and password.');app.show('music-hub');return;}
    const [ink,paper,accent]=groupThemes[activeGroup.theme_index]||groupThemes[0];
    const screen=$r('group-screen'),stage=$r('group-stage');screen.style.setProperty('--group-ink',ink);screen.style.setProperty('--group-paper',paper);screen.style.setProperty('--group-accent',accent);screen.style.setProperty('--group-font',groupFonts[activeGroup.font_index]||groupFonts[0]);
    $r('group-screen-title').textContent=activeGroup.name;$r('group-stage-date').textContent=formatDay(app.getDay())+' / A PRIVATE LISTENING ROOM';
    stage.querySelector('.group-stage-photo')?.remove();
    if(activeGroup.room_path){const image=el('img','group-stage-photo');image.alt='Group background chosen by the owner';stage.prepend(image);void setPrivateMedia(image,activeGroup.room_path);}
    await loadGroupSongs();
  }
  async function loadGroupSongs(){
    if(!activeGroup)return;const request=++groupRequest,groupId=activeGroup.id,day=app.getDay();
    $r('group-board-title').textContent='Loading this group…';
    try{
      const result=await client.from('group_songs').select('id,group_id,owner_id,day,daily_slot,title,artist,nickname,note,audio_path,source_url,cover_path,created_at').eq('group_id',groupId).eq('day',day).order('created_at',{ascending:false});
      if(result.error)throw result.error;const rows=result.data||[],ids=rows.map(x=>x.id),rMap=new Map(),cMap=new Map();
      for(let i=0;i<ids.length;i+=100){const chunk=ids.slice(i,i+100);const [rr,cc]=await Promise.all([
        client.from('group_reactions').select('song_id,user_id,emoji').in('song_id',chunk),
        client.from('group_comments').select('id,song_id,user_id,nickname,body,image_path,created_at').in('song_id',chunk).order('created_at')]);
        if(rr.error)throw rr.error;if(cc.error)throw cc.error;
        for(const row of rr.data||[]){const list=rMap.get(row.song_id)||[];list.push(row);rMap.set(row.song_id,list);}
        for(const row of cc.data||[]){const list=cMap.get(row.song_id)||[];list.push(row);cMap.set(row.song_id,list);}
      }
      if(request!==groupRequest||window.daytoneGroupId!==groupId||app.getDay()!==day)return;
      groupSongs=rows;groupReactions=rMap;groupComments=cMap;
      if(window.daytoneGroupPeriod==='all')await loadGroupAllTime(request,groupId);else renderGroupBoard();
      const dialog=$r('group-discussion-dialog');if(dialog.open&&dialog.dataset.songId)openGroupDiscussion(dialog.dataset.songId,true);
    }catch(error){if(request===groupRequest){$r('group-board-title').textContent='Could not load this group';toast(error.message||'Please try again.');}}
  }
  async function loadGroupAllTime(request=groupRequest,groupId=activeGroup?.id){
    if(!groupId)return;
    const {data,error}=await client.rpc('group_music_alltime_top',{p_group_id:groupId});
    if(request!==groupRequest||window.daytoneGroupId!==groupId)return;
    if(error){toast('Could not load the group’s all-time chart.');return;}
    groupAllTime=(data||[]).map(row=>({...row.song,supporters:Number(row.supporters)}));renderGroupBoard();
  }
  function groupVisualCard(song,rank){
    const card=el('article','group-visual-card '+(rank===1?'first':'')+(song?' has-song':' is-empty'));
    card.style.setProperty('--rank-number','"0'+rank+'"');
    const artPath=activeGroup?.['top'+rank+'_path'];
    if(artPath){const background=el('img','group-card-backdrop');background.alt='Group artwork';card.append(background);void setPrivateMedia(background,artPath);}
    card.append(el('small','group-rank-label','TOP 0'+rank));
    const disc=el('button','group-disc');disc.type='button';disc.disabled=!song;disc.setAttribute('aria-label',song?'Open '+song.title+' discussion':'No song yet');
    const center=el('span','group-disc-center');if(song?.cover_path){const image=el('img');image.alt=song.title+' cover';center.append(image);void setPrivateMedia(image,song.cover_path);}else center.append(el('span','','DAYTONE'));
    disc.append(center);if(song)disc.addEventListener('click',()=>openGroupDiscussion(song.id));card.append(disc);
    const info=el('div','group-card-info');if(song){info.append(el('small','', '@'+song.nickname+' · '+groupSongScore(song)+' supporters'),el('h3','',song.title));if(song.artist)info.append(el('p','',song.artist));info.append(smallCopy(song.title));}
    else info.append(el('h3','',rank===1?'The first record is yours.':'A place for the next song.'));card.append(info);return card;
  }
  function renderGroupBoard(){
    const ranked=rankedGroupSongs(),top=$r('group-top-three');top.replaceChildren(groupVisualCard(ranked[1],2),groupVisualCard(ranked[0],1),groupVisualCard(ranked[2],3));
    const allTime=window.daytoneGroupPeriod==='all';
    $r('group-board-title').textContent=allTime?'All-time Top 3':'Today’s Top 3';
    $r('group-period-today').classList.toggle('selected',!allTime);$r('group-period-all').classList.toggle('selected',allTime);
    $r('group-stage-date').textContent=allTime?'ALL-TIME / A PRIVATE LISTENING ROOM':formatDay(app.getDay())+' / A PRIVATE LISTENING ROOM';
    const list=$r('group-song-list');list.replaceChildren();
    const all=[...groupSongs].sort((a,b)=>a.nickname.localeCompare(b.nickname,'en')||b.created_at.localeCompare(a.created_at));let last='';
    if(!all.length)list.append(el('p','group-empty',allTime?'No songs have been shared here today.':'No songs have been shared here on this date.'));
    for(const song of all){if(song.nickname!==last){list.append(el('h3','publisher-heading','@'+song.nickname));last=song.nickname;}
      const row=el('article','group-list-song'),open=el('button','group-list-open');open.type='button';open.append(el('strong','',song.title),el('small','',song.artist||'Shared by '+song.nickname));open.addEventListener('click',()=>openGroupDiscussion(song.id));row.append(open,smallCopy(song.title));list.append(row);}
  }

  function addDialog(id,markup){const dialog=el('dialog','room-dialog');dialog.id=id;dialog.innerHTML=markup;document.body.append(dialog);return dialog;}
  function setupDialogs(){
    addDialog('group-create-dialog',`<form id="group-create-form"><div class="dialog-head"><div><p class="kicker">A ROOM OF YOUR OWN</p><h2>Create a private group</h2></div><button type="button" data-close aria-label="Close">×</button></div><p class="dialog-intro">Only people with your code and password can join. You can create up to three groups.</p><label>Group name<input name="name" required maxlength="60" placeholder="A name your friends will know"></label><label>Group password<input name="password" type="password" required minlength="8" maxlength="72" autocomplete="new-password" placeholder="At least eight characters"></label><p class="form-error" role="alert"></p><div class="form-actions"><button class="primary-button" type="submit">Create group ↗</button></div></form>`);
    addDialog('group-join-dialog',`<form id="group-join-form"><div class="dialog-head"><div><p class="kicker">AN INVITATION</p><h2>Join a private group</h2></div><button type="button" data-close aria-label="Close">×</button></div><p class="dialog-intro">Ask a member for the group code and password.</p><label>Group code<input name="code" required maxlength="16" minlength="16" spellcheck="false" placeholder="16-character code"></label><label>Group password<input name="password" type="password" required autocomplete="current-password"></label><p class="form-error" role="alert"></p><div class="form-actions"><button class="primary-button" type="submit">Join group ↗</button></div></form>`);
    addDialog('group-song-dialog',`<form id="group-song-form"><div class="dialog-head"><div><p class="kicker">PRIVATE MUSIC / TODAY</p><h2>Share with your group</h2></div><button type="button" data-close aria-label="Close">×</button></div><p class="dialog-intro">Only the title is required. Up to three songs per member per group each day.</p><label>Song title<input name="title" required maxlength="100" placeholder="A song for your group"></label><label>Artist (optional)<input name="artist" maxlength="100"></label><label>Note (optional)<textarea name="note" maxlength="500" rows="3"></textarea></label><label>Audio file (optional · 8 MB max)<input name="audio" type="file" accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,audio/wav,audio/webm,.mp3,.m4a,.ogg,.wav,.webm"></label><label>Music link (optional)<input name="source_url" type="url" placeholder="https://…"></label><label>Cover photo (optional · compressed below 1 MB)<input name="cover" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label><p class="form-error" role="alert"></p><div class="form-actions"><button class="primary-button" type="submit">Share in group ↗</button></div></form>`);
    addDialog('group-discussion-dialog',`<div class="discussion-dialog-shell"><button type="button" data-close class="discussion-close" aria-label="Close discussion">×</button><div id="group-discussion-body"></div></div>`);
    addDialog('group-art-dialog',`<div class="group-art-shell"><div class="dialog-head"><div><p class="kicker">A GROUP GALLERY</p><h2>Design this room</h2></div><button type="button" data-close aria-label="Close">×</button></div><p class="dialog-intro">Each group starts with a fixed paper design and a coordinated color and font. Members can suggest photos for the room or Top 3 backgrounds. The group creator chooses which suggestion appears.</p><form id="group-art-form"><label>Where should this image go?<select name="slot"><option value="room">Room background</option><option value="top1">Top 1 background</option><option value="top2">Top 2 background</option><option value="top3">Top 3 background</option></select></label><label>Your image<input name="image" type="file" required accept="image/jpeg,image/png,image/webp,image/gif"></label><p class="form-error" role="alert"></p><button class="primary-button" type="submit">Suggest artwork ↗</button></form><div id="group-art-ideas" class="group-art-ideas"></div></div>`);
    document.querySelectorAll('.room-dialog [data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
    $r('group-create-form').addEventListener('submit',event=>void createGroup(event));
    $r('group-join-form').addEventListener('submit',event=>void joinGroup(event));
    $r('group-song-form').addEventListener('submit',event=>void publishGroupSong(event));
    $r('group-art-form').addEventListener('submit',event=>void submitArtwork(event));
  }
  async function createGroup(event){event.preventDefault();if(!requireAccount())return;const form=event.currentTarget,button=form.querySelector('[type="submit"]'),error=form.querySelector('.form-error');error.textContent='';button.disabled=true;
    try{const {data,error:failed}=await client.rpc('create_music_group',{p_name:form.elements.name.value.trim(),p_password:form.elements.password.value});if(failed)throw failed;
      const groupId=Array.isArray(data)?data[0]?.group_id:data?.group_id;if(!groupId)throw Error('Group could not be created.');form.reset();form.closest('dialog').close();await loadGroups();renderHub();app.openGroup(groupId);toast('Group created. Copy the code to invite friends.');}
    catch(failed){error.textContent=failed.message||'Could not create group.';}finally{button.disabled=false;}}
  async function joinGroup(event){event.preventDefault();if(!requireAccount())return;const form=event.currentTarget,button=form.querySelector('[type="submit"]'),error=form.querySelector('.form-error');error.textContent='';button.disabled=true;
    try{const {data,error:failed}=await client.rpc('join_music_group',{p_code:form.elements.code.value.trim().toUpperCase(),p_password:form.elements.password.value});if(failed)throw failed;
      if(!data)throw Error('Invalid code or password, or too many attempts.');form.reset();form.closest('dialog').close();await loadGroups();renderHub();app.openGroup(data);toast('You joined the group.');}
    catch(failed){error.textContent=failed.message||'Could not join group.';}finally{button.disabled=false;}}
  async function uploadGroupFile(file,types,maxBytes){if(!(file instanceof File)||!file.size)return null;if(file.size>maxBytes)throw Error(maxBytes>1024*1024?'Audio must be under 8 MB.':'Image must be under 1 MB.');const ext=types[file.type];if(!ext)throw Error('Unsupported file type.');
    const path=activeGroup.id+'/'+user.id+'/'+crypto.randomUUID()+'.'+ext;
    const {error}=await client.storage.from('group-media').upload(path,file,{upsert:false,contentType:file.type,cacheControl:'3600'});if(error)throw error;return path;}
  async function publishGroupSong(event){event.preventDefault();if(!requireAccount()||!activeGroup)return;const form=event.currentTarget,error=form.querySelector('.form-error'),button=form.querySelector('[type="submit"]');error.textContent='';const data=new FormData(form),title=String(data.get('title')||'').trim(),artist=String(data.get('artist')||'').trim(),note=String(data.get('note')||'').trim(),audio=form.elements.audio.files[0],cover=form.elements.cover.files[0],urlText=String(data.get('source_url')||'').trim();
    if(!title){error.textContent='Enter a song title.';return;}let sourceUrl=null;if(urlText){try{const url=new URL(urlText);if(url.protocol!=='https:')throw Error();sourceUrl=url.href;}catch{error.textContent='Music links must start with https://.';return;}}
    button.disabled=true;const uploaded=[];try{const day=today(),usedResult=await client.from('group_songs').select('daily_slot').eq('group_id',activeGroup.id).eq('owner_id',user.id).eq('day',day);if(usedResult.error)throw usedResult.error;const used=new Set((usedResult.data||[]).map(x=>x.daily_slot));if(used.size>=3)throw Error('You have shared three songs in this group today.');
      const audioPath=await uploadGroupFile(audio,audioTypes,8*1024*1024);if(audioPath)uploaded.push({bucket:'group-media',path:audioPath});const coverPath=await uploadGroupFile(await prepareImage(cover),imageTypes,1024*1024);if(coverPath)uploaded.push({bucket:'group-media',path:coverPath});
      const record={group_id:activeGroup.id,owner_id:user.id,day,title,artist,nickname:profile.nickname,note,audio_path:audioPath,source_url:sourceUrl,cover_path:coverPath,file_size:audioPath?audio.size:null};let saved=false;
      for(const slot of [1,2,3]){if(used.has(slot))continue;const result=await client.from('group_songs').insert({...record,daily_slot:slot});if(!result.error){saved=true;break;}if(result.error.code!=='23505')throw result.error;}if(!saved)throw Error('You have shared three songs in this group today.');
      form.reset();form.closest('dialog').close();app.setDay(day);await loadGroupSongs();toast('Song shared with your group.');
    }catch(failed){await cleanUploads(uploaded);error.textContent=failed.message||'Could not share song.';}finally{button.disabled=false;}}

  async function loadArtworkIdeas(){if(!activeGroup)return;const {data,error}=await client.from('group_artwork_submissions').select('id,group_id,owner_id,slot,image_path,created_at').eq('group_id',activeGroup.id).order('created_at',{ascending:false}).limit(80);if(error){toast(error.message);return;}artworkIdeas=data||[];renderArtworkIdeas();}
  function renderArtworkIdeas(){const host=$r('group-art-ideas');host.replaceChildren();host.append(el('h3','','Artwork suggested by members'));
    if(!artworkIdeas.length){host.append(el('p','', 'No suggestions yet. The original paper design is ready to use.'));return;}
    const grid=el('div','art-idea-grid');for(const idea of artworkIdeas){const card=el('article','art-idea'),img=el('img');img.alt=idea.slot+' background suggestion';card.append(img,el('small','',idea.slot.toUpperCase()));void setPrivateMedia(img,idea.image_path);
      if(user?.id===activeGroup.owner_id){const button=el('button','outline-button','Use this artwork');button.type='button';button.addEventListener('click',async()=>{button.disabled=true;const {data,error}=await client.rpc('select_music_group_art',{p_group_id:activeGroup.id,p_slot:idea.slot,p_submission_id:idea.id});button.disabled=false;if(error||!data){toast(error?.message||'Could not select artwork.');return;}await loadGroups();activeGroup=groups.find(x=>x.id===activeGroup.id);await renderGroup();toast('Group artwork updated.');});card.append(button);}
      grid.append(card);}host.append(grid);}
  async function submitArtwork(event){event.preventDefault();if(!requireAccount()||!activeGroup)return;const form=event.currentTarget,error=form.querySelector('.form-error'),button=form.querySelector('[type="submit"]'),slot=form.elements.slot.value;error.textContent='';button.disabled=true;let path=null;
    try{path=await uploadGroupFile(await prepareImage(form.elements.image.files[0]),imageTypes,1024*1024);if(!path)throw Error('Choose an image.');const result=await client.from('group_artwork_submissions').insert({group_id:activeGroup.id,owner_id:user.id,slot,image_path:path});if(result.error)throw result.error;form.reset();await loadArtworkIdeas();toast('Artwork suggestion added.');}
    catch(failed){if(path)await cleanUploads([{bucket:'group-media',path}]);error.textContent=failed.message||'Could not upload artwork.';}finally{button.disabled=false;}}
  function reactionButtons(host,song){const rows=groupReactions.get(song.id)||[];for(const symbol of emoji){const count=rows.filter(x=>x.emoji===symbol).length,chosen=rows.some(x=>x.emoji===symbol&&x.user_id===user?.id),button=el('button','reaction'+(chosen?' chosen':''),symbol+' '+count);button.type='button';button.setAttribute('aria-pressed',String(chosen));button.addEventListener('click',()=>void reactGroupSong(song.id,symbol,chosen));host.append(button);}}
  async function reactGroupSong(id,symbol,chosen){if(!requireAccount())return;try{const result=chosen?await client.from('group_reactions').delete().eq('song_id',id).eq('user_id',user.id):await client.from('group_reactions').upsert({song_id:id,user_id:user.id,emoji:symbol},{onConflict:'song_id,user_id'});if(result.error)throw result.error;await loadGroupSongs();}catch(error){toast(error.message||'Could not react.');}}
  function openGroupDiscussion(id,refresh=false){
    const song=groupSongs.find(x=>x.id===id)||groupAllTime.find(x=>x.id===id);if(!song)return;
    if(window.daytoneGroupPeriod==='all'&&song.day!==app.getDay()){
      window.daytoneGroupPeriod='today';app.setDay(song.day);void loadGroupSongs().then(()=>openGroupDiscussion(id));return;
    }
    const dialog=$r('group-discussion-dialog');dialog.dataset.songId=id;const host=$r('group-discussion-body');host.replaceChildren();
    host.append(el('small','kicker','PRIVATE GROUP / '+activeGroup.name),el('h2','',song.title),el('p','song-byline',(song.artist?song.artist+' · ':'')+'@'+song.nickname));
    if(song.cover_path){const art=el('img','group-discussion-cover');art.alt=song.title+' cover';host.append(art);void setPrivateMedia(art,song.cover_path);}
    if(song.note)host.append(el('p','song-note',song.note));host.append(smallCopy(song.title));
    if(song.audio_path){const audio=el('audio','song-player');audio.controls=true;audio.preload='none';audio.setAttribute('aria-label','Play '+song.title);host.append(audio);void setPrivateMedia(audio,song.audio_path);}
    else if(song.source_url){const link=el('a','open-link','Listen on the original platform ↗');link.href=song.source_url;link.target='_blank';link.rel='noopener noreferrer';host.append(link);}
    const actions=el('div','group-reactions');reactionButtons(actions,song);host.append(actions);
    const commentsForSong=groupComments.get(id)||[],list=el('div','comment-list');list.append(el('h3','publisher-heading','Discussion · '+commentsForSong.length));
    for(const item of commentsForSong){const line=el('div','comment');line.append(el('strong','',item.nickname),el('time','',new Date(item.created_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})));if(item.body)line.append(el('p','',item.body));if(item.image_path){const img=el('img');img.alt=item.nickname+' shared photo';line.append(img);void setPrivateMedia(img,item.image_path);}list.append(line);}host.append(list);
    const form=el('form','comment-form');form.innerHTML='<label>Reply<textarea name="body" maxlength="500" rows="3" placeholder="Ask, respond, or share a photo…"></textarea></label><label>Photo (optional)<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label><p class="comment-error" role="alert"></p><button type="submit">Post reply ↗</button>';
    form.addEventListener('submit',event=>void publishGroupComment(event,id));host.append(form);if(!refresh||!dialog.open)dialog.showModal();
  }
  async function publishGroupComment(event,id){event.preventDefault();if(!requireAccount()||!activeGroup)return;const form=event.currentTarget,error=form.querySelector('.comment-error'),button=form.querySelector('[type="submit"]'),body=form.elements.body.value.trim(),file=form.elements.image.files[0];error.textContent='';if(!body&&!file){error.textContent='Write a reply or add a photo.';return;}button.disabled=true;let path=null;
    try{path=await uploadGroupFile(await prepareImage(file),imageTypes,1024*1024);const result=await client.from('group_comments').insert({song_id:id,user_id:user.id,nickname:profile.nickname,body,image_path:path});if(result.error)throw result.error;await loadGroupSongs();toast('Reply posted in your group.');}
    catch(failed){if(path)await cleanUploads([{bucket:'group-media',path}]);error.textContent=failed.message||'Could not post reply.';}finally{button.disabled=false;}}
  function wireEvents(){
    $r('hub-back').addEventListener('click',()=>app.show('lobby'));
    $r('hub-create-group').addEventListener('click',()=>{if(requireAccount())showDialog('group-create-dialog');});
    $r('hub-join-group').addEventListener('click',()=>{if(requireAccount())showDialog('group-join-dialog');});
    $r('group-back').addEventListener('click',()=>app.show('music-hub'));
    $r('group-copy-code').addEventListener('click',async()=>{if(!activeGroup)return;try{await navigator.clipboard.writeText(activeGroup.code);toast('Group code copied. Share the password separately.');}catch{toast('Could not copy the code.');}});
    $r('group-art-open').addEventListener('click',()=>{if(!activeGroup||!requireAccount())return;showDialog('group-art-dialog');void loadArtworkIdeas();});
    $r('group-share-song').addEventListener('click',()=>{if(activeGroup&&requireAccount())showDialog('group-song-dialog');});
    $r('group-toggle-list').addEventListener('click',()=>{const list=$r('group-song-list');list.hidden=!list.hidden;$r('group-toggle-list').textContent=list.hidden?'View all songs ↗':'Hide all songs ↑';});
    $r('group-period-today').addEventListener('click',()=>{window.daytoneGroupPeriod='today';app.show('group');});
    $r('group-period-all').addEventListener('click',()=>{window.daytoneGroupPeriod='all';app.show('group');});
    $r('calendar-feedback').addEventListener('click',openFeedback);
    $r('feedback-close').addEventListener('click',()=> $r('feedback-dialog').close());
    $r('feedback-cancel').addEventListener('click',()=> $r('feedback-dialog').close());
    $r('feedback-form').addEventListener('submit',event=>void sendFeedback(event));
  }
  setupDialogs();wireEvents();renderFollowControls();renderCalendarCharts();void refreshAccount();
  window.DaytoneMusicRooms={renderHub,renderGroup,renderCalendarCharts,refreshAccount,allTimePublicSongs,loadAllTimePublic,genrePalette:key=>palettes[key]};
  app.refresh();
})();
