/* A song opens immediately; remote players load only after the listener asks. */
(() => {
  const dialog=document.createElement('dialog');
  dialog.id='listen-dialog';dialog.className='listen-dialog';
  dialog.innerHTML='<div class="listen-shell"><div class="listen-top"><div><small>DAYTONE / LISTEN</small><h2>Listen</h2></div><button type="button" aria-label="Close player">×</button></div><div id="listen-body"></div></div>';
  document.body.append(dialog);
  const body=dialog.querySelector('#listen-body');
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  const dock=document.createElement('section');dock.id='daytone-player-dock';dock.className='daytone-player-dock';dock.hidden=true;
  dock.innerHTML='<div class="player-dock-head"><div><small>NOW PLAYING / DAYTONE</small><strong id="player-dock-title"></strong><span id="player-dock-artist"></span></div><div class="player-dock-actions"><a id="player-dock-source" target="_blank" rel="noopener noreferrer">Original ↗</a><button type="button" id="player-dock-close" aria-label="Stop and close player">×</button></div></div><div id="player-dock-content"></div>';
  document.body.append(dock);
  const dockContent=dock.querySelector('#player-dock-content');
  const videoDialog=document.createElement('dialog');videoDialog.id='daytone-video-dialog';videoDialog.className='daytone-video-dialog';
  videoDialog.innerHTML='<div class="video-dialog-shell"><div class="video-dialog-head"><div><small>DAYTONE / VIDEO</small><h2 id="video-dialog-title"></h2><p id="video-dialog-artist"></p></div><button type="button" class="video-dialog-close" aria-label="Close video">×</button></div><div id="video-dialog-player" class="video-dialog-player"></div><div class="video-dialog-foot"><span>Shared version</span><div><button type="button" id="video-fullscreen">⛶ Full screen</button><a id="video-original" target="_blank" rel="noopener noreferrer">YouTube ↗</a></div></div></div>';
  document.body.append(videoDialog);
  const videoStage=videoDialog.querySelector('#video-dialog-player');
  videoDialog.querySelector('.video-dialog-close').addEventListener('click',()=>videoDialog.close());
  videoDialog.addEventListener('close',()=>videoStage.replaceChildren());
  videoDialog.querySelector('#video-fullscreen').addEventListener('click',()=>videoStage.querySelector('iframe')?.requestFullscreen?.());
  dock.querySelector('#player-dock-close').addEventListener('click',()=>{dockContent.querySelectorAll('audio').forEach(audio=>audio.pause());dockContent.replaceChildren();dock.hidden=true;document.body.classList.remove('player-dock-open');});
  let request=0;
  const node=(tag,className,value)=>{const item=document.createElement(tag);item.className=className;if(value!=null)item.textContent=value;return item;};
  const normal=value=>String(value||'').normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  function platform(value){try{const host=new URL(value).hostname;return ['soundcloud.com','www.soundcloud.com','m.soundcloud.com'].includes(host)?'SoundCloud':['bilibili.com','www.bilibili.com','m.bilibili.com'].includes(host)?'Bilibili':['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be'].includes(host)?'YouTube':['c6.y.qq.com','y.qq.com','i.y.qq.com'].includes(host)?'QQ Music':['music.163.com','y.music.163.com'].includes(host)?'NetEase Music':host==='open.spotify.com'?'Spotify':host==='music.apple.com'?'Apple Music':'Original link';}catch{return 'Original link';}}
  function directLink(url,label){const link=node('a','listen-original',label+' ↗');link.href=url;link.target='_blank';link.rel='noopener noreferrer';return link;}
  function searchLinks(title,artist){
    const term=[title,artist].filter(Boolean).join(' '),links=node('div','listen-links');
    for(const [host,label] of [
      ['https://y.qq.com/n/ryqq/search?w=','QQ Music'],
      ['https://music.163.com/#/search/m/?s=','NetEase Music'],
      ['https://www.bilibili.com/search?keyword=','Bilibili'],
      ['https://soundcloud.com/search?q=','SoundCloud'],
      ['https://www.youtube.com/results?search_query=','YouTube'],
      ['https://open.spotify.com/search/','Spotify'],
      ['https://music.apple.com/us/search?term=','Apple Music']
    ]){const link=node('a','listen-provider',label+' ↗');link.href=host+encodeURIComponent(term);link.target='_blank';link.rel='noopener noreferrer';links.append(link);}
    return links;
  }
  function playerFor(url){const player=typeof musicEmbed==='function'?musicEmbed(url):null;if(player){player.classList.add('listen-player');if(player.tagName==='IFRAME')player.loading='eager';}return player;}
  function openDock(song,player){
    dockContent.querySelectorAll('audio').forEach(audio=>audio.pause());dockContent.replaceChildren();
    dock.querySelector('#player-dock-title').textContent=song.title||'';
    dock.querySelector('#player-dock-artist').textContent=song.artist||'';
    const link=dock.querySelector('#player-dock-source');link.hidden=!song.source_url;if(song.source_url){link.href=song.source_url;link.textContent='Open on '+platform(song.source_url)+' ↗';}
    dock.classList.toggle('video',player.classList.contains('video-player'));
    dock.classList.toggle('soundcloud',platform(song.source_url)==='SoundCloud');
    if(player.tagName==='IFRAME'){
      const url=new URL(player.src);url.searchParams.set(url.hostname==='w.soundcloud.com'?'auto_play':'autoplay',url.hostname==='w.soundcloud.com'?'true':'1');player.src=url.href;
      const status=node('p','player-dock-status','Opening '+platform(song.source_url)+'…');dockContent.append(status,player);
      const timer=setTimeout(()=>{if(status.isConnected)status.textContent='Still loading? Use the original link above.';},6000);
      player.addEventListener('load',()=>{clearTimeout(timer);status.remove();},{once:true});
    }else{dockContent.append(player);if(player.tagName==='AUDIO')void player.play().catch(()=>{});}
    dock.hidden=false;document.body.classList.add('player-dock-open');if(dialog.open)dialog.close();
  }
  function attachPlayer(player,label,sourceUrl){
    if(player.tagName!=='IFRAME'){body.append(player);return;}
    const stage=node('div','listen-player-stage'),status=node('p','listen-player-status','Opening '+label+'…');
    stage.append(status,player);body.append(stage);
    const timer=setTimeout(()=>{if(stage.isConnected&&status.isConnected)status.textContent='Still loading? Open in '+label+' instead.';},6000);
    player.addEventListener('load',()=>{clearTimeout(timer);status.remove();stage.classList.add('ready');},{once:true});
    if(sourceUrl){const link=directLink(sourceUrl,'Open in '+label);link.classList.add('listen-player-link');stage.after(link);}
  }
  function sourceSection(song){
    if(song.audio_path){const audio=node('audio','listen-player');audio.controls=true;audio.preload='metadata';audio.src=publicFile('tracks',song.audio_path);body.append(audio);void audio.play().catch(()=>{});return true;}
    if(!song.source_url)return false;
    const label=platform(song.source_url),player=playerFor(song.source_url);
    if(player){attachPlayer(player,label,song.source_url);return true;}
    body.append(directLink(song.source_url,'Open in '+label));return true;
  }
  async function findRecording(title,artist,current){
    const status=node('p','listen-note','Looking for a recording…');(body.querySelector('.listen-artist')||body.querySelector('h3')).after(status);
    try{
      const query=new URL('https://itunes.apple.com/search');query.search=new URLSearchParams({term:[title,artist].filter(Boolean).join(' '),media:'music',entity:'song',country:'us',limit:'8'}).toString();
      const response=await fetch(query,{mode:'cors',signal:AbortSignal.timeout(6500)});if(!response.ok)throw Error();
      const data=await response.json();if(current!==request||!dialog.open)return;
      const wanted=normal(title),by=normal(artist);
      const score=item=>(normal(item.trackName)===wanted?8:normal(item.trackName).includes(wanted)?2:0)+(by&&normal(item.artistName)===by?5:0);
      const matches=(data.results||[]).filter(item=>item.kind==='song'&&item.trackName&&item.trackViewUrl&&score(item)>=2).sort((a,b)=>score(b)-score(a)).slice(0,3);
      if(!matches.length){status.textContent='No matching recording found. Search an app below.';return;}
      status.textContent='Choose a recording:';
      const choices=node('div','listen-choices');status.after(choices);
      for(const item of matches){const button=node('button','listen-choice');button.type='button';button.append(node('strong','',item.trackName),node('span','',[item.artistName,item.collectionName].filter(Boolean).join(' · ')));button.addEventListener('click',()=>{choices.querySelectorAll('button').forEach(choice=>choice.classList.toggle('selected',choice===button));body.querySelector('.listen-player-stage,.listen-catalog-player')?.remove();body.querySelector('.listen-player-link')?.remove();const player=playerFor(item.trackViewUrl);if(player){player.classList.add('listen-catalog-player');attachPlayer(player,'Apple Music',item.trackViewUrl);}});choices.append(button);}
    }catch{if(current===request&&dialog.open)status.textContent='Could not find a recording. Search an app below.';}
  }
  function open(song){
    const current=++request,title=String(song?.title||'').trim(),artist=String(song?.artist||'').trim();if(!title)return;
    if(song.audio_path){const audio=node('audio','listen-player');audio.controls=true;audio.preload='metadata';audio.src=publicFile('tracks',song.audio_path);openDock(song,audio);return;}
    if(song.source_url){const player=playerFor(song.source_url);if(player){openDock(song,player);return;}}
    body.replaceChildren();body.append(node('h3','',title));if(artist)body.append(node('p','listen-artist',artist));
    if(!dialog.open)dialog.showModal();
    const hasSource=sourceSection(song);
    body.append(node('p','listen-source-label','Find it in another app'),searchLinks(title,artist));
    if(!hasSource)void findRecording(title,artist,current);
  }
  function openVideo(song){
    if(platform(song?.source_url)!=='YouTube')return;
    const player=playerFor(song.source_url);if(!player)return;
    if(!dock.hidden){dockContent.replaceChildren();dock.hidden=true;document.body.classList.remove('player-dock-open');}
    videoStage.replaceChildren();player.loading='eager';player.src+=(player.src.includes('?')?'&':'?')+'autoplay=1';videoStage.append(player);
    videoDialog.querySelector('#video-dialog-title').textContent=song.title||'Video';
    videoDialog.querySelector('#video-dialog-artist').textContent=song.artist||'';
    videoDialog.querySelector('#video-original').href=song.source_url;
    if(!videoDialog.open)videoDialog.showModal();
  }
  dialog.addEventListener('close',()=>{++request;body.querySelectorAll('audio').forEach(audio=>audio.pause());body.replaceChildren();});
  window.DaytoneListen={open,openVideo};
})();
