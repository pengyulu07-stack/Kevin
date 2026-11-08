/* Read public platform metadata in the visitor's browser; always let the author review it. */
(() => {
  function metadataUrl(value) {
    try {
      const url = new URL(value.trim());
      if (url.protocol !== 'https:') return null;
      if (url.hostname === 'open.spotify.com' && /^\/(track|album|playlist)\/[A-Za-z0-9]{22}\/?$/.test(url.pathname))
        return {platform:'Spotify', endpoint:'https://open.spotify.com/oembed?url='+encodeURIComponent(url.origin+url.pathname)};
      if (['soundcloud.com','www.soundcloud.com','m.soundcloud.com'].includes(url.hostname)) {
        const parts=url.pathname.split('/').filter(Boolean);
        if(parts.length===2&&!['search','discover','you','stream','charts','settings'].includes(parts[0]))
          return {platform:'SoundCloud',endpoint:'https://soundcloud.com/oembed?format=json&url='+encodeURIComponent('https://soundcloud.com/'+parts.map(encodeURIComponent).join('/'))};
      }
      if (url.hostname === 'music.apple.com') {
        const match=url.pathname.match(/\/(song|album)\/[^/]+\/(\d+)/);
        const id=url.searchParams.get('i')||match?.[2];
        if(id && /^\d{4,20}$/.test(id))return {platform:'Apple Music', endpoint:'https://itunes.apple.com/lookup?id='+id+'&entity=song', id};
      }
    } catch { /* The form will validate the link when it is published. */ }
    return null;
  }
  function cleanSpotifyTitle(title){return String(title||'').replace(/\s*\|\s*Spotify\s*$/i,'').replace(/\s*[-–]\s*(?:song|album|playlist) by .+$/i,'').trim();}
  async function read(value){
    const target=metadataUrl(value);if(!target)return null;
    const response=await fetch(target.endpoint,{mode:'cors',signal:AbortSignal.timeout(7000)});
    if(!response.ok)throw Error('Metadata unavailable');
    const data=await response.json();
    if(target.platform==='Spotify')return {title:cleanSpotifyTitle(data.title),artist:String(data.author_name||'').trim(),art:data.thumbnail_url||'',platform:target.platform};
    if(target.platform==='SoundCloud'){
      const full=String(data.title||'').trim(),parts=full.split(/\s+by\s+/i);
      return {title:parts[0]||full,artist:parts.length>1?parts.slice(1).join(' by '):'',art:data.thumbnail_url||'',platform:target.platform};
    }
    const row=data.results?.find(item=>String(item.trackId||item.collectionId)===target.id)||data.results?.[0];
    if(!row)return null;
    return {title:row.trackName||row.collectionName||'',artist:row.artistName||'',album:row.collectionName||'',art:(row.artworkUrl100||'').replace(/100x100bb/,'300x300bb'),url:row.trackViewUrl||'',genre:row.primaryGenreName||'',platform:target.platform};
  }
  function setupTitleSearch(form,linkReader){
    const title=form?.elements.title,artist=form?.elements.artist;if(!title||!artist)return;
    const button=document.createElement('button');button.type='button';button.className='link-read-button';button.textContent='Find song details';
    const status=document.createElement('small');status.className='link-read-status';status.setAttribute('role','status');
    const results=document.createElement('div');results.className='song-lookup-results';results.setAttribute('aria-label','Matching recordings');
    const preview=document.createElement('div');preview.className='catalog-cover-preview';preview.hidden=true;
    const sources=document.createElement('details');sources.className='publish-source-search';
    const summary=document.createElement('summary');summary.textContent='Find a playable version';
    const hint=document.createElement('p');hint.textContent='Open a search, check the version, then paste its link into Music or video link below.';
    const links=document.createElement('div');links.className='publish-source-links';
    const providers=[['YouTube','https://www.youtube.com/results?search_query='],['Bilibili','https://search.bilibili.com/all?keyword='],['SoundCloud','https://soundcloud.com/search?q=']];
    const sourceLinks=providers.map(([name,base])=>{const link=document.createElement('a');link.textContent=name+' ↗';link.target='_blank';link.rel='noopener noreferrer';link.dataset.base=base;links.append(link);return link;});
    const updateSources=()=>{const query=[title.value.trim(),artist.value.trim()].filter(Boolean).join(' ');for(const link of sourceLinks){if(query)link.href=link.dataset.base+encodeURIComponent(query);else link.removeAttribute('href');link.setAttribute('aria-disabled',String(!query));link.tabIndex=query?0:-1;}};
    sources.append(summary,hint,links);
    title.closest('label').after(button,status,preview,results,sources);
    updateSources();title.addEventListener('input',updateSources);artist.addEventListener('input',updateSources);
    let timer,sequence=0,suggestedArtist='',lastMusicBrainzRequest=0;
    const artwork=value=>{
      try {const url=new URL(value);return url.protocol==='https:' && (url.hostname==='mzstatic.com'||url.hostname.endsWith('.mzstatic.com')||url.hostname==='i1.sndcdn.com'||url.hostname==='i2.sndcdn.com'||url.hostname==='coverartarchive.org')?url.href:'';} catch{return '';}
    };
    const genreFor=value=>{
      const genre=String(value||'').toLowerCase();
      const rules=[[/hip.hop|rap/, 'hiphop'],[/trap/, 'trap'],[/r&b|soul/, 'rnb'],[/metal/, 'metal'],[/punk/, 'punk'],[/alternative/, 'alternative'],[/indie/, 'indie'],[/rock/, 'rock'],[/house/, 'house'],[/techno/, 'techno'],[/dubstep/, 'dubstep'],[/edm/, 'edm'],[/ambient/, 'ambient'],[/lo.fi/, 'lofi'],[/funk/, 'funk'],[/electronic|electronica/, 'electronic'],[/dance/, 'dance'],[/jazz/, 'jazz'],[/blues/, 'blues'],[/piano/, 'piano'],[/instrumental/, 'instrumental'],[/acoustic/, 'acoustic'],[/singer.songwriter/, 'singer_songwriter'],[/opera|choral/, 'opera'],[/classical/, 'classical'],[/soundtrack|film score/, 'soundtrack'],[/anime/, 'anime'],[/folk/, 'folk'],[/country/, 'country'],[/afrobeats/, 'afrobeats'],[/reggae/, 'reggae'],[/latin/, 'latin'],[/gospel/, 'gospel'],[/experimental/, 'experimental'],[/new.age/, 'newage'],[/k.pop/, 'kpop'],[/j.pop/, 'jpop'],[/city.pop/, 'citypop'],[/mandopop/, 'mandopop'],[/cantopop/, 'cantopop'],[/chinese/, 'chinese'],[/pop/, 'pop']];
      return rules.find(([pattern])=>pattern.test(genre))?.[1]||'';
    };
    const suggestGenre=row=>{
      const key=genreFor(row.primaryGenreName||row.genre);
      if(!key)return;
      const choices=[...form.querySelectorAll('input[name="genres"]')];
      if(choices.some(choice=>choice.checked&&choice.value!=='other'))return;
      for(const choice of choices)choice.checked=choice.value===key;
      form.querySelector('.upload-genres')?.setAttribute('open','');
    };
    const clearCatalog=()=>{delete form.dataset.catalogArtUrl;delete form.dataset.catalogUrl;preview.replaceChildren();preview.hidden=true;};
    const showCatalog=row=>{
      clearCatalog();const art=artwork(String(row.artworkUrl100||row.art||'').replace(/100x100(?:bb|-75)?/,'300x300bb'));
      if(!art)return;
      form.dataset.catalogArtUrl=art;form.dataset.catalogUrl=row.trackViewUrl||row.url||'';
      const image=document.createElement('img');image.src=art;image.alt='Album cover';image.loading='lazy';
      image.addEventListener('error',()=>{clearCatalog();status.textContent='This recording has no usable cover. You can add your own photo.';},{once:true});
      const label=document.createElement('span');label.textContent='Album cover found · '+(row.collectionName||row.album||row.trackName||row.title||'');
      const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.addEventListener('click',()=>{clearCatalog();status.textContent='Cover removed. You can still add your own photo.';});
      preview.append(image,label,remove);preview.hidden=false;
    };
    const select=(row,automatic)=>{
      if(!automatic)title.value=row.trackName;
      if(!automatic||!artist.value.trim()){artist.value=row.artistName;suggestedArtist=row.artistName;}
      suggestGenre(row);
      updateSources();
      showCatalog(row);
      status.replaceChildren(document.createTextNode((automatic?'Matched: ':'Selected: ')+row.trackName+' · '+row.artistName+'. Check the details. '));
      if(row.trackViewUrl){const source=document.createElement('a');source.href=row.trackViewUrl;source.target='_blank';source.rel='noopener noreferrer';source.textContent='View on '+(row.catalogName||'Apple Music')+' ↗';status.append(source);}
      if(!automatic)results.replaceChildren();
    };
    title.addEventListener('input',()=>{
      clearTimeout(timer);++sequence;clearCatalog();
      if(suggestedArtist&&artist.value===suggestedArtist){artist.value='';suggestedArtist='';}
      results.replaceChildren();status.textContent='';
      const value=title.value.trim();if(value.length<3||/^https:\/\//i.test(value))return;
      timer=setTimeout(()=>void search(),950);
    });
    artist.addEventListener('change',()=>{if(title.value.trim().length>=3)void search();});
    form.addEventListener('reset',clearCatalog);
    title.addEventListener('paste',()=>setTimeout(()=>{
      clearTimeout(timer);const value=title.value.trim();if(!value)return;
      if(/^https:\/\//i.test(value)){
        const link=form.elements.url;if(link){link.value=value;title.value='';const radio=form.querySelector('input[name="source"][value="link"]');radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));if(metadataUrl(value))linkReader?.click();else status.textContent='Link added. Enter the song title to publish.';}
      }else void search();
    },100));
    async function search(){
      clearTimeout(timer);const current=++sequence;
      const query=[title.value.trim(),artist.value.trim()].filter(Boolean).join(' ');results.replaceChildren();
      if(!title.value.trim()){status.textContent='Enter a song title first.';return;}
      button.disabled=true;status.textContent='Checking song details…';
      try{
        const normal=value=>String(value||'').normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
        const wantedTitle=normal(title.value),wantedArtist=normal(artist.value);
        const score=row=>{const foundTitle=normal(row.trackName),foundArtist=normal(row.artistName);return (foundTitle===wantedTitle?6:foundTitle.includes(wantedTitle)?2:0)+(wantedArtist?(foundArtist===wantedArtist?5:foundArtist.includes(wantedArtist)?2:0):0);};
        const countries=/[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(query)?['jp','us']:/[\p{Script=Han}]/u.test(query)?['cn','tw','hk']:['us','gb'];
        const storefronts=await Promise.allSettled(countries.map(async country=>{
          const url=new URL('https://itunes.apple.com/search');url.search=new URLSearchParams({term:query,media:'music',entity:'song',country,limit:'12'}).toString();
          const response=await fetch(url,{mode:'cors',signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Search unavailable');
          const data=await response.json();return (data.results||[]).filter(row=>row.kind==='song'&&row.trackName&&row.artistName&&row.trackViewUrl).map(row=>({...row,catalogName:'Apple Music'}));
        }));
        if(current!==sequence)return;
        let tracks=storefronts.flatMap(result=>result.status==='fulfilled'?result.value:[]);
        if(!tracks.some(row=>normal(row.trackName)===wantedTitle&&(!wantedArtist||normal(row.artistName)===wantedArtist))){
          try{
            const pause=Math.max(0,1100-(Date.now()-lastMusicBrainzRequest));
            if(pause)await new Promise(resolve=>setTimeout(resolve,pause));
            if(current!==sequence)return;
            lastMusicBrainzRequest=Date.now();
            const mb=new URL('https://musicbrainz.org/ws/2/recording/');
            mb.search=new URLSearchParams({query:'recording:"'+title.value.trim().replaceAll('"','')+'"'+(artist.value.trim()?' AND artist:"'+artist.value.trim().replaceAll('"','')+'"':''),fmt:'json',limit:'12'}).toString();
            const response=await fetch(mb,{mode:'cors',signal:AbortSignal.timeout(6000)});
            if(!response.ok)throw Error('MusicBrainz unavailable');
            const data=await response.json();if(current!==sequence)return;
            tracks.push(...(data.recordings||[]).filter(row=>row.title&&row['artist-credit']?.length).map(row=>{
              const release=row.releases?.find(item=>item['release-group']?.id)||row.releases?.[0];
              const groupId=release?.['release-group']?.id;
              return {trackName:row.title,artistName:row['artist-credit'].map(item=>typeof item==='string'?item:(item.name||'')+(item.joinphrase||'')).join('').trim(),collectionName:release?.title||'',artworkUrl100:groupId?'https://coverartarchive.org/release-group/'+groupId+'/front-250':'',trackViewUrl:'https://musicbrainz.org/recording/'+row.id,catalogName:'MusicBrainz',primaryGenreName:''};
            }));
          }catch{ /* Title-only sharing remains available. */ }
        }
        tracks=tracks.filter(row=>{
          const found=normal(row.trackName);
          return found===wantedTitle || (wantedTitle.length>=5 && found.includes(wantedTitle));
        }).filter((row,index,array)=>array.findIndex(item=>normal(item.trackName)===normal(row.trackName)&&normal(item.artistName)===normal(row.artistName)&&normal(item.collectionName)===normal(row.collectionName))===index).sort((a,b)=>score(b)-score(a)).slice(0,6);
        if(!tracks.length){status.textContent='No clear match. Keep your own title and artist, or paste a music link.';return;}
        const exact=tracks.filter(row=>normal(row.trackName)===wantedTitle);
        const candidates=wantedArtist?exact.filter(row=>normal(row.artistName)===wantedArtist):exact;
        const artists=new Set(candidates.map(row=>normal(row.artistName)));
        if(candidates.length && artists.size===1)select(candidates[0],true);
        else status.textContent='Choose the right artist and album. Your title can stay as written.';
        for(const row of tracks){
          const option=document.createElement('button');option.type='button';option.className='song-lookup-option';
          const art=artwork(String(row.artworkUrl100||'').replace(/100x100(?:bb|-75)?/,'300x300bb'));
          if(art){const image=document.createElement('img');image.src=art;image.alt='';image.loading='lazy';image.addEventListener('error',()=>image.remove(),{once:true});option.append(image);}
          const words=document.createElement('span');words.append(document.createElement('strong'),document.createElement('small'));words.firstChild.textContent=row.trackName;words.lastChild.textContent=[row.artistName,row.collectionName,row.catalogName].filter(Boolean).join(' · ');option.append(words);
          if(art&&form.dataset.catalogArtUrl===art)option.setAttribute('aria-pressed','true');
          option.addEventListener('click',()=>select(row,false));results.append(option);
        }
      }catch{if(current===sequence)status.textContent='Could not search right now. You can publish with just the title.';}
      finally{if(current===sequence)button.disabled=false;}
    }
    button.addEventListener('click',()=>void search());
    form.addEventListener('daytone:catalog-found',event=>{const row=event.detail;if(row?.art)showCatalog(row);if(row)suggestGenre(row);updateSources();});
  }
  function setup(form,input,title,artist,playlist=false){
    if(!form||!input||!title)return;
    const button=document.createElement('button');button.type='button';button.className='link-read-button';button.textContent='Get title from link ↗';
    const status=document.createElement('small');status.className='link-read-status';status.setAttribute('role','status');
    input.closest('label').after(button,status);
    button.addEventListener('click',async()=>{
      const value=input.value.trim();if(!value){status.textContent='Paste a music link first.';return;}
      button.disabled=true;status.textContent='Checking the link…';
      try{
        const result=await read(value);
        if(!result){status.textContent='Paste a direct track link to read its details. Search result pages still need a song title.';return;}
        if(result.title)title.value=result.title;
        if(artist&&result.artist)artist.value=result.artist;
        form.dispatchEvent(new CustomEvent('daytone:catalog-found',{detail:result}));
        status.replaceChildren(document.createTextNode('Found on '+result.platform+'. Check the details before publishing.'));
        if(playlist)status.append(document.createTextNode(' Add or paste the track names below; the platform does not provide a readable full list here.'));
      }catch{status.textContent='Could not read details from this link. Enter the title manually; the original link will still work.';}
      finally{button.disabled=false;}
    });
    input.addEventListener('paste',()=>setTimeout(()=>{if(input.value.trim())button.click();},100));
    return button;
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const song=document.getElementById('upload-form');
    const linkReader=setup(song,song?.elements.url,song?.elements.title,song?.elements.artist);
    setupTitleSearch(song,linkReader);
    if(song?.elements.url){
      const preview=document.createElement('div');preview.className='youtube-publish-preview';preview.hidden=true;
      preview.innerHTML='<img alt="Selected YouTube video thumbnail"><div><strong>Check this video version</strong><p>This is the video listeners will see.</p><label><input type="checkbox" name="confirm_video"> Yes, this is the version I want to share</label></div>';
      song.elements.url.closest('label').after(preview);
      const update=()=>{
        const value=song.elements.url.value,id=typeof youtubeVideoId==='function'?youtubeVideoId(value):'';
        preview.hidden=!id;preview.querySelector('input').checked=false;
        if(id)preview.querySelector('img').src='https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';
        else preview.querySelector('img').removeAttribute('src');
      };
      song.elements.url.addEventListener('input',update);song.elements.url.addEventListener('change',update);
      song.addEventListener('reset',()=>setTimeout(update,0));
    }
    const playlist=document.getElementById('playlist-form');
    setup(playlist,playlist?.elements.source_url,playlist?.elements.title,null,true);
  });
})();
