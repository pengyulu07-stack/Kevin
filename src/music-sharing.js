/* A share has a recording or a release identity; both keep the same social post id. */
(() => {
  const norm=value=>window.AilleursMusicSearch?.normal(value)||String(value||'').normalize('NFKC').toLowerCase().trim();
  const artworkCache=new Map();
  const safe=(value,kind)=>{
    try{const url=new URL(value);if(url.protocol!=='https:')return '';const host=url.hostname;
      return (kind==='source'?host==='music.apple.com':kind==='art'?host==='mzstatic.com'||host.endsWith('.mzstatic.com'):host==='itunes.apple.com'||host.endsWith('.itunes.apple.com')||host==='mzstatic.com'||host.endsWith('.mzstatic.com'))?url.href:'';
    }catch{return '';}
  };
  function sanitize(data){
    if(!data||typeof data!=='object')return {};
    const text=(v,max=160)=>String(v||'').slice(0,max);
    const tracks=(Array.isArray(data.tracks)?data.tracks:[]).slice(0,100).map(row=>({id:text(row.id,30),title:text(row.title),artist:text(row.artist),trackNumber:Math.max(1,Math.min(999,Number(row.trackNumber)||1)),discNumber:Math.max(1,Math.min(99,Number(row.discNumber)||1)),source_url:safe(row.source_url,'source'),previewUrl:safe(row.previewUrl,'preview')})).filter(row=>row.id&&row.title&&row.source_url);
    return {provider:'apple',collectionId:text(data.collectionId,30),trackId:text(data.trackId,30),title:text(data.title),artist:text(data.artist),releaseDate:text(data.releaseDate,30),artworkUrl:safe(data.artworkUrl,'art'),source_url:safe(data.source_url,'source'),entryTrackId:text(data.entryTrackId,30),tracks};
  }
  function dataFor(form){
    let data;try{data=sanitize(JSON.parse(form.dataset.catalogData||'{}'));}catch{return {};}
    if(norm(data.title)!==norm(form.elements.title.value)||norm(data.artist)!==norm(form.elements.artist.value))return {};
    return data;
  }
  function artFor(song){
    const bundled=sanitize(song?.catalog_data).artworkUrl;if(bundled)return bundled;
    const key=String(song?.source_url||'');if(artworkCache.has(key))return artworkCache.get(key)||'';
    let link,id;try{link=new URL(key);if(link.protocol!=='https:'||link.hostname!=='music.apple.com')return '';id=link.searchParams.get('i')||link.pathname.match(/\/(?:song|album)\/[^/]+\/(\d+)/)?.[1];if(!/^\d{4,20}$/.test(id||''))return '';}catch{return '';}
    artworkCache.set(key,'');
    void (async()=>{try{await window.AilleursMusicSearch?.ready;const url=new URL('https://itunes.apple.com/lookup');url.search=new URLSearchParams({id,entity:'song',country:link.pathname.split('/')[1]||'us'}).toString();const response=await fetch(url,{signal:AbortSignal.timeout(5500)});if(!response.ok)return;const body=await response.json();const row=(body.results||[]).find(row=>String(row.trackId||row.collectionId)===id);if(!row||norm(row.trackName||row.collectionName)!==norm(song.title)||norm(row.artistName)!==norm(song.artist))return;const art=safe(String(row.artworkUrl100||'').replace('100x100bb','600x600bb'),'art');if(!art)return;artworkCache.set(key,art);window.dispatchEvent(new CustomEvent('daytone:artwork-resolved',{detail:{id:song.id,url:art}}));}catch{}})();
    return '';
  }
  window.addEventListener('daytone:artwork-resolved',event=>{for(const target of document.querySelectorAll('[data-artwork-pending="true"]')){if(target.dataset.artworkSong!==String(event.detail.id))continue;const image=el('img');image.src=event.detail.url;image.alt='Album cover';image.loading='lazy';target.replaceChildren(image);target.dataset.artworkPending='false';target.classList.add('has-image');}});
  async function selectAlbum(row,form){
    const request=String((Number(form.dataset.albumRequest)||0)+1);form.dataset.albumRequest=request;
    const host=form.querySelector('.album-entry');host.hidden=false;host.replaceChildren(el('p','','Loading album tracks…'));
    let tracks=[];
    try{
      const bundled=await window.AilleursCatalog?.album(row.collectionId);
      if(bundled)tracks=bundled.tracks;
      else{const country=row.storefront||new URL(row.trackViewUrl).pathname.split('/')[1]||'us';const url=new URL('https://itunes.apple.com/lookup');url.search=new URLSearchParams({id:String(row.collectionId),entity:'song',country,limit:'200'}).toString();const response=await fetch(url,{signal:AbortSignal.timeout(6500)});if(response.ok){const body=await response.json();tracks=(body.results||[]).filter(x=>x.kind==='song');}}
    }catch{ /* The release can still be shared without an invented track list. */ }
    if(form.dataset.albumRequest!==request||form.elements.share_type.value!=='album')return;
    const data=sanitize({collectionId:row.collectionId,title:row.trackName,artist:row.artistName,releaseDate:row.releaseDate,artworkUrl:form.dataset.catalogArtUrl,source_url:row.trackViewUrl,tracks:tracks.map(x=>({id:x.trackId,title:x.trackName,artist:x.artistName,trackNumber:x.trackNumber,discNumber:x.discNumber,source_url:x.trackViewUrl,previewUrl:x.previewUrl}))});
    form.dataset.catalogData=JSON.stringify(data);
    host.replaceChildren();
    if(!data.tracks.length){host.append(el('p','','Track list unavailable for this version.'));return;}
    const label=el('label','','Start with a track (optional)'),select=el('select');select.name='entry_track';select.append(new Option('No entry track — choose an album video',''));
    data.tracks.forEach(track=>select.append(new Option(track.trackNumber+'. '+track.title,track.id)));
    select.addEventListener('change',()=>{const entry=data.tracks.find(t=>t.id===select.value);data.entryTrackId=entry?.id||'';form.dataset.catalogData=JSON.stringify(data);form.dataset.entryTrackTitle=entry?.title||'';form.dispatchEvent(new CustomEvent('daytone:entry-track-selected'));});
    label.append(select);host.append(label,el('small','',data.tracks.length+' tracks found'));
  }
  function setRecording(form,row){
    form.dataset.catalogData=JSON.stringify(sanitize({collectionId:row.collectionId,trackId:row.trackId,title:row.trackName,artist:row.artistName,releaseDate:row.releaseDate,artworkUrl:form.dataset.catalogArtUrl,source_url:row.trackViewUrl}));
  }
  function mountAlbum(host,song){
    if(song.share_type!=='album')return;
    const data=sanitize(song.catalog_data),rows=data.tracks||[];if(!rows.length)return;
    const area=el('section','shared-album-tracks'),heading=el('h3','','Tracks');area.append(heading);
    const play=track=>window.DaytoneListen?.open({id:song.id+'-'+track.id,title:track.title,artist:track.artist||song.artist,album:song.title,previewUrl:track.previewUrl,source_url:track.source_url,catalogCover:songCoverUrl(song),nickname:song.nickname});
    const entry=rows.find(x=>x.id===data.entryTrackId);if(entry){const button=el('button','album-entry-play','▶ Start with '+entry.title);button.type='button';button.addEventListener('click',()=>play(entry));area.append(button);}
    const list=(tracks,start)=>{const ol=el('ol');ol.start=start;for(const track of tracks){const li=el('li'),button=el('button','album-track-preview',track.title);button.type='button';button.setAttribute('aria-label','Preview '+track.title);button.addEventListener('click',()=>play(track));li.append(button);ol.append(li);}return ol;};
    area.append(list(rows.slice(0,3),1));if(rows.length>3){const details=el('details'),summary=el('summary','','All '+rows.length+' tracks');details.append(summary,list(rows.slice(3),4));area.append(details);}
    area.append(el('small','','30-second previews provided courtesy of iTunes.'));
    const comments=host.querySelector('.comment-section');if(comments)comments.before(area);else host.append(area);
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const form=document.getElementById('upload-form');if(!form)return;
    const mode=el('fieldset','music-share-kind'),legend=el('legend','','Share');mode.append(legend);
    for(const [value,name] of [['song','Song'],['album','Album']]){const label=el('label'),input=el('input');input.type='radio';input.name='share_type';input.value=value;input.checked=value==='song';label.append(input,document.createTextNode(name));mode.append(label);}
    form.querySelector('.dialog-intro').after(mode);
    const entry=el('section','album-entry');entry.hidden=true;form.elements.note.closest('label').after(entry);
    const update=()=>{
      const album=form.elements.share_type.value==='album';form.dataset.shareType=album?'album':'song';
      document.getElementById('dialog-title').textContent=album?'Share an album':'Share a song';
      form.elements.title.closest('label').firstChild.textContent=album?'Album title':'Song title';form.elements.title.placeholder=album?'An album for today':'A song for today';
      form.elements.album.closest('label').hidden=album;if(album)form.elements.album.value=form.elements.title.value;
      document.getElementById('submit-song').textContent=album?'Publish album':'Publish song';
    };
    mode.addEventListener('change',()=>{delete form.dataset.catalogData;delete form.dataset.entryTrackTitle;entry.hidden=true;form.dataset.albumRequest=String((Number(form.dataset.albumRequest)||0)+1);update();form.elements.title.dispatchEvent(new Event('input',{bubbles:true}));});
    form.addEventListener('reset',()=>{delete form.dataset.catalogData;delete form.dataset.entryTrackTitle;entry.hidden=true;form.dataset.albumRequest=String((Number(form.dataset.albumRequest)||0)+1);setTimeout(update,0);});
    update();
  });
  window.AilleursMusicSharing={sanitize,dataFor,selectAlbum,setRecording,mountAlbum,artFor};
})();
