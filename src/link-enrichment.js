/* Read public platform metadata in the visitor's browser; always let the author review it. */
(() => {
  function metadataUrl(value) {
    try {
      const url = new URL(value.trim());
      if (url.protocol !== 'https:') return null;
      if (typeof youtubeVideoId==='function' && youtubeVideoId(url.href))
        return {platform:'YouTube',endpoint:'song-link-preview'};
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
    if(target.platform==='YouTube'){
      const response=await client.functions.invoke('song-link-preview',{body:{url:value}});
      if(response.error||!response.data?.title)throw Error('Video details unavailable');
      return {title:response.data.title,artist:'',channel:response.data.artist||'',art:response.data.art||'',platform:'YouTube'};
    }
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
    const title=form?.elements.title,artist=form?.elements.artist,album=form?.elements.album,note=form?.elements.note;if(!title||!artist)return;
    const button=document.createElement('button');button.type='button';button.className='link-read-button';button.textContent='Find recording again';
    const status=document.createElement('small');status.className='link-read-status';status.setAttribute('role','status');
    const results=document.createElement('div');results.className='song-lookup-results';results.setAttribute('aria-label','Matching recordings');
    const sample=document.createElement('audio');sample.className='publish-sample';sample.controls=true;sample.hidden=true;sample.preload='none';sample.setAttribute('aria-label','30-second recording preview provided courtesy of iTunes');
    const preview=document.createElement('div');preview.className='catalog-cover-preview';preview.hidden=true;
    const sources=document.createElement('details');sources.className='publish-source-search';
    const summary=document.createElement('summary');summary.textContent='Search another music platform';
    const hint=document.createElement('p');hint.textContent='Choose the exact version, then paste its link below.';
    const links=document.createElement('div');links.className='publish-source-links';
    const providers=[['YouTube','https://www.youtube.com/results?search_query='],['Bilibili','https://search.bilibili.com/all?keyword='],['SoundCloud','https://soundcloud.com/search?q='],['QQ Music','https://y.qq.com/n/ryqq/search?w='],['网易云音乐','https://music.163.com/#/search/m/?s='],['Spotify','https://open.spotify.com/search/']];
    const sourceLinks=providers.map(([name,base])=>{const link=document.createElement('a');link.textContent=name+' ↗';link.target='_blank';link.rel='noopener noreferrer';link.dataset.base=base;links.append(link);return link;});
    const updateSources=()=>{const query=[title.value.trim(),artist.value.trim()].filter(Boolean).join(' ');for(const link of sourceLinks){if(query)link.href=link.dataset.base+encodeURIComponent(query);else link.removeAttribute('href');link.setAttribute('aria-disabled',String(!query));link.tabIndex=query?0:-1;}};
    sources.append(summary,hint,links);sources.open=false;
    artist.closest('label').after(button,status,preview,results,sample,sources);
    updateSources();title.addEventListener('input',updateSources);artist.addEventListener('input',updateSources);
    let timer,sequence=0,suggestedArtist='',suggestedAlbum='',suggestedNote='',lastMusicBrainzRequest=0;
    const artwork=value=>{
      try {const url=new URL(value);return url.protocol==='https:' && (url.hostname==='mzstatic.com'||url.hostname.endsWith('.mzstatic.com')||url.hostname==='i1.sndcdn.com'||url.hostname==='i2.sndcdn.com'||url.hostname==='coverartarchive.org'||url.hostname==='i.ytimg.com')?url.href:'';} catch{return '';}
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
    const stopSample=()=>{sample.pause();sample.removeAttribute('src');sample.load();sample.hidden=true;};
    const clearCatalog=()=>{
      const autoUrl=form.dataset.catalogAutoSourceUrl;
      if(autoUrl&&form.elements.url?.value.trim()===autoUrl){
        form.elements.url.value='';
        const titleOnly=form.querySelector('input[name="source"][value="none"]');
        if(titleOnly){titleOnly.checked=true;titleOnly.dispatchEvent(new Event('change',{bubbles:true}));}
      }
      delete form.dataset.catalogAutoSourceUrl;
      delete form.dataset.catalogArtUrl;
      delete form.dataset.catalogUrl;
      if(album&&suggestedAlbum&&album.value===suggestedAlbum)album.value='';
      if(note&&suggestedNote&&note.value===suggestedNote)note.value='';
      suggestedAlbum='';suggestedNote='';
      preview.replaceChildren();preview.hidden=true;
    };
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
      if(form.dataset.videoAutoSelection&&form.elements.video_url?.value===form.dataset.videoAutoSelection){form.elements.video_url.value='';form.elements.video_url.dispatchEvent(new Event('input',{bubbles:true}));delete form.dataset.videoAutoSelection;}
      const previousAlbum=suggestedAlbum,previousNote=suggestedNote;
      const canFillAlbum=album&&(!album.value.trim()||album.value===previousAlbum);
      const canFillNote=note&&(!note.value.trim()||note.value===previousNote);
      if(!automatic)title.value=row.trackName;
      if(!automatic||!artist.value.trim()){artist.value=row.artistName;suggestedArtist=row.artistName;}
      suggestGenre(row);
      updateSources();
      showCatalog(row);
      if(album&&canFillAlbum){suggestedAlbum=String(row.collectionName||'').slice(0,120);album.value=suggestedAlbum;}
      if(row.catalogName==='Apple Music'&&/^https:\/\//i.test(row.trackViewUrl||'')&&!form.elements.url.value.trim()&&form.querySelector('input[name="source"]:checked')?.value!=='file'){
        form.elements.url.value=row.trackViewUrl;
        form.dataset.catalogAutoSourceUrl=row.trackViewUrl;
        const linked=form.querySelector('input[name="source"][value="link"]');
        if(linked){linked.checked=true;linked.dispatchEvent(new Event('change',{bubbles:true}));}
      }
      status.replaceChildren(document.createTextNode((automatic?'Matched: ':'Selected: ')+row.trackName+' · '+row.artistName+'. Check the details. '));
      if(row.trackViewUrl){const source=document.createElement('a');source.href=row.trackViewUrl;source.target='_blank';source.rel='noopener noreferrer';source.textContent='View on '+(row.catalogName||'Apple Music')+' ↗';status.append(source);}
      form.dispatchEvent(new CustomEvent('daytone:recording-selected',{detail:{title:title.value,artist:artist.value}}));
      for(const option of results.querySelectorAll('.song-lookup-option'))option.setAttribute('aria-pressed',String(option.dataset.recording===String(row.trackViewUrl||'')));
    };
    title.addEventListener('input',()=>{
      clearTimeout(timer);++sequence;clearCatalog();
      if(suggestedArtist&&artist.value===suggestedArtist){artist.value='';suggestedArtist='';}
      results.replaceChildren();stopSample();status.textContent='';
      const value=title.value.trim();if(value.length<3||/^https:\/\//i.test(value))return;
      timer=setTimeout(()=>void search(),950);
    });
    artist.addEventListener('input',()=>{clearCatalog();stopSample();results.replaceChildren();status.textContent='';});
    artist.addEventListener('change',()=>{if(title.value.trim().length>=3)void search();});
    form.addEventListener('reset',()=>{clearCatalog();stopSample();results.replaceChildren();status.textContent='';});
    title.addEventListener('paste',()=>setTimeout(()=>{
      clearTimeout(timer);const value=title.value.trim();if(!value)return;
      if(/^https:\/\//i.test(value)){
        const link=form.elements.url;if(link){link.value=value;title.value='';const radio=form.querySelector('input[name="source"][value="link"]');radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));link.dispatchEvent(new Event('input',{bubbles:true}));}
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
        const bundled=await window.AilleursCatalog?.search(title.value.trim(),artist.value.trim())||[];
        const countries=/[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(query)?['jp','us']:/[\p{Script=Han}]/u.test(query)?['cn','tw','hk']:['us','gb'];
        const storefronts=bundled.some(row=>normal(row.trackName)===wantedTitle&&wantedArtist&&normal(row.artistName)===wantedArtist)?[]:await Promise.allSettled(countries.map(async country=>{
          const url=new URL('https://itunes.apple.com/search');url.search=new URLSearchParams({term:query,media:'music',entity:'song',country,limit:'12'}).toString();
          const response=await fetch(url,{mode:'cors',signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Search unavailable');
          const data=await response.json();return (data.results||[]).filter(row=>row.kind==='song'&&row.trackName&&row.artistName&&row.trackViewUrl).map(row=>({...row,catalogName:'Apple Music'}));
        }));
        if(current!==sequence)return;
        let tracks=[...bundled.map(row=>({...row,catalogName:'Apple Music'})),...storefronts.flatMap(result=>result.status==='fulfilled'?result.value:[])];
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
        }).filter((row,index,array)=>array.findIndex(item=>normal(item.trackName)===normal(row.trackName)&&normal(item.artistName)===normal(row.artistName)&&normal(item.collectionName)===normal(row.collectionName))===index).sort((a,b)=>score(b)-score(a)).slice(0,10);
        if(!tracks.length){status.textContent='No clear match. Keep your own title and artist, or paste a music link.';return;}
        const exact=tracks.filter(row=>normal(row.trackName)===wantedTitle);
        status.textContent='Choose the correct recording below. Check the artist, album and 30-second preview before publishing.';
        for(const row of tracks){
          const line=document.createElement('div');line.className='song-lookup-row';
          const option=document.createElement('button');option.type='button';option.className='song-lookup-option';
          option.dataset.recording=String(row.trackViewUrl||'');
          const art=artwork(String(row.artworkUrl100||'').replace(/100x100(?:bb|-75)?/,'300x300bb'));
          if(art){const image=document.createElement('img');image.src=art;image.alt='';image.loading='lazy';image.addEventListener('error',()=>image.remove(),{once:true});option.append(image);}
          const words=document.createElement('span');words.append(document.createElement('strong'),document.createElement('small'));words.firstChild.textContent=row.trackName;words.lastChild.textContent=[row.artistName,row.collectionName,row.catalogName].filter(Boolean).join(' · ');option.append(words);
          if(art&&form.dataset.catalogArtUrl===art)option.setAttribute('aria-pressed','true');
          option.addEventListener('click',()=>select(row,false));line.append(option);
          if(/^https:\/\//i.test(row.previewUrl||'')){
            const play=document.createElement('button');play.type='button';play.className='song-lookup-sample';play.textContent='▷ 30s';play.setAttribute('aria-label','Play 30-second preview of '+row.trackName+' by '+row.artistName);
            play.addEventListener('click',()=>{if(sample.src!==row.previewUrl){sample.src=row.previewUrl;sample.hidden=false;}void sample.play().catch(()=>{status.textContent='Preview could not play here. Choose another recording or check its source.';});});line.append(play);
          }
          results.append(line);
        }
      }catch{if(current===sequence)status.textContent='Could not search right now. You can publish with just the title.';}
      finally{if(current===sequence)button.disabled=false;}
    }
    button.addEventListener('click',()=>void search());
    form.addEventListener('daytone:catalog-found',event=>{const row=event.detail;if(row?.art)showCatalog(row);if(row)suggestGenre(row);updateSources();if(['Spotify','SoundCloud'].includes(row?.platform)&&title.value.trim().length>=3&&artist.value.trim())void search();});
  }
  function setup(form,input,title,artist,playlist=false){
    if(!form||!input||!title)return;
    const button=document.createElement('button');button.type='button';button.className='link-read-button';button.textContent='Check link details';
    const status=document.createElement('small');status.className='link-read-status';status.setAttribute('role','status');
    input.closest('label').after(button,status);
    let timer,sequence=0,filledTitle='',filledArtist='';
    const inspect=async()=>{
      const value=input.value.trim(),current=++sequence;
      if(!value){status.textContent='';return;}
      if(!metadataUrl(value)){status.textContent='Link saved. Add or check the song title and artist yourself.';return;}
      button.disabled=true;status.textContent='Checking the link…';
      try{
        const result=await read(value);
        if(current!==sequence||input.value.trim()!==value)return;
        if(!result){status.textContent='Paste a direct track link to read its details. Search result pages still need a song title.';return;}
        if(result.title&&(!title.value.trim()||title.value===filledTitle)){title.value=result.title.slice(0,100);filledTitle=title.value;}
        if(artist&&result.artist&&(!artist.value.trim()||artist.value===filledArtist)){artist.value=result.artist.slice(0,100);filledArtist=artist.value;}
        form.dispatchEvent(new CustomEvent('daytone:catalog-found',{detail:result}));
        status.textContent='Found on '+result.platform+(result.channel?' · channel: '+result.channel:'')+'. Check the title, artist and exact version.';
        if(playlist)status.append(document.createTextNode(' Add or paste the track names below; the platform does not provide a readable full list here.'));
      }catch{if(current===sequence)status.textContent='Could not read this link. Enter the title yourself; the link remains attached.';}
      finally{if(current===sequence)button.disabled=false;}
    };
    button.addEventListener('click',()=>{clearTimeout(timer);void inspect();});
    input.addEventListener('input',()=>{clearTimeout(timer);++sequence;button.disabled=false;status.textContent='';if(input.value.trim())timer=setTimeout(()=>void inspect(),550);});
    input.addEventListener('change',()=>{clearTimeout(timer);if(input.value.trim())void inspect();});
    form.addEventListener('reset',()=>{clearTimeout(timer);++sequence;filledTitle='';filledArtist='';status.textContent='';button.disabled=false;});
    return button;
  }
  function setupQuickImport(form){
    const title=form?.elements.title,artist=form?.elements.artist,link=form?.elements.url;
    if(!title||!artist||!link)return;
    const wrap=document.createElement('section');wrap.className='share-import';
    const label=document.createElement('label');label.textContent='Paste a song link or copied share text';
    const field=document.createElement('textarea');field.rows=2;field.placeholder='https://… or a share message with a link';field.setAttribute('aria-describedby','share-import-status');
    const status=document.createElement('small');status.id='share-import-status';status.setAttribute('role','status');
    label.append(field);wrap.append(label,status);title.closest('label').before(wrap);
    const apply=()=>{
      const value=field.value.trim();if(!value){status.textContent='';return;}
      const url=value.match(/https:\/\/[^\s<>"“”]+/i)?.[0]?.replace(/[，。！？,.;!?）)]+$/u,'');
      if(!url){status.textContent='No link found. Add a direct track or video link below.';return;}
      try {new URL(url);} catch {status.textContent='This link could not be read.';return;}
      if(/open\.spotify\.com\/playlist\/|music\.apple\.com\/[^/]+\/playlist\/|soundcloud\.com\/[^/]+\/sets\//i.test(url)){
        status.textContent='This is a playlist link. Use Share a playlist to keep its tracks together.';return;
      }
      const prose=value.replace(url,' ').trim();
      link.value=url;const radio=form.querySelector('input[name="source"][value="link"]');radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
      if(!title.value.trim()){
        const marked=prose.match(/《([^》]{1,100})》/u);
        if(marked)title.value=marked[1].trim();
      }
      if(!artist.value.trim()){
        const marked=prose.match(/(?:歌手|演唱|artist)\s*[:：]\s*([^\n，,。]{1,100})/iu);
        if(marked)artist.value=marked[1].trim();
      }
      link.dispatchEvent(new Event('input',{bubbles:true}));
      status.textContent='Link added. Details will be checked automatically; review the version before publishing.';
    };
    field.addEventListener('paste',()=>setTimeout(apply,0));
    field.addEventListener('change',apply);
    form.addEventListener('reset',()=>{field.value='';status.textContent='';});
  }
  function setupSourcePreview(form,fieldName='url'){
    const link=form?.elements[fieldName];if(!link)return;
    const wrap=document.createElement('div');wrap.className='publish-source-preview';wrap.dataset.sourceField=fieldName;wrap.hidden=true;
    const button=document.createElement('button');button.type='button';button.textContent='▷ Preview this version here';
    const note=document.createElement('small');note.textContent='Playback can depend on the platform and your account.';
    const stage=document.createElement('div');stage.className='publish-preview-stage';
    wrap.append(button,note,stage);link.closest('label').after(wrap);
    let last='';
    const update=()=>{
      const value=link.value.trim();if(value===last)return;last=value;stage.replaceChildren();
      const playable=typeof musicEmbed==='function'?musicEmbed(value):null;
      wrap.hidden=!playable;
      if(playable)button.disabled=false;
    };
    button.addEventListener('click',()=>{
      const player=typeof musicEmbed==='function'?musicEmbed(link.value.trim()):null;
      if(!player){update();return;}
      if(player.tagName==='IFRAME')player.loading='eager';
      stage.replaceChildren(player);button.disabled=true;
    });
    link.addEventListener('input',update);link.addEventListener('change',update);
    form.addEventListener('reset',()=>setTimeout(()=>{last='';update();},0));
  }
  function setupVideoSuggestions(form){
    const title=form?.elements.title,artist=form?.elements.artist,link=form?.elements.url;
    if(!title||!artist||!link)return;
    const section=document.createElement('section');section.className='publish-video-results';section.hidden=true;
    const heading=document.createElement('h3');heading.textContent='Choose a video';
    const status=document.createElement('p');status.setAttribute('role','status');
    const cards=document.createElement('div');cards.className='publish-video-grid';
    const stage=document.createElement('div');stage.className='publish-video-stage';
    const fallback=document.createElement('a');fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.textContent='Search on YouTube ↗';
    const bilibili=document.createElement('a');bilibili.target='_blank';bilibili.rel='noopener noreferrer';bilibili.textContent='Search on Bilibili ↗';
    section.append(heading,status,cards,stage,fallback,bilibili);
    form.querySelector('.publish-source-search')?.after(section);
    let timer,sequence=0,unavailable=false;
    const updateFallback=()=>{const q=encodeURIComponent([title.value.trim(),artist.value.trim()].filter(Boolean).join(' '));fallback.href='https://www.youtube.com/results?search_query='+q;bilibili.href='https://search.bilibili.com/all?keyword='+q;};
    const render=items=>{
      cards.replaceChildren();stage.replaceChildren();
      for(const item of items.slice(0,3)){
        const card=document.createElement('article');card.className='publish-video-card';
        const watch=document.createElement('button');watch.type='button';watch.className='publish-video-watch';watch.setAttribute('aria-label','Preview '+item.title);
        const image=document.createElement('img');image.src=item.thumbnail;image.alt='';image.loading='lazy';
        const symbol=document.createElement('span');symbol.textContent='▶';watch.append(image,symbol);
        watch.addEventListener('click',()=>{
          const player=typeof musicEmbed==='function'?musicEmbed(item.url):null;if(!player)return;
          player.loading='eager';const url=new URL(player.src);url.searchParams.set('autoplay','1');player.src=url.href;stage.replaceChildren(player);
        });
        const info=document.createElement('div');const name=document.createElement('strong');name.textContent=item.title;const channel=document.createElement('small');channel.textContent=item.channel;
        const select=document.createElement('button');select.type='button';select.textContent='Use this video';select.addEventListener('click',()=>{
          const video=form.elements.video_url||link;video.value=item.url;video.dispatchEvent(new Event('input',{bubbles:true}));
          form.dataset.videoAutoSelection=item.url;
          if(form.elements.confirm_video)form.elements.confirm_video.checked=true;
          status.textContent='Selected: '+item.title;
        });
        info.append(name,channel,select);card.append(watch,info);cards.append(card);
      }
    };
    const search=async()=>{
      const current=++sequence,song=title.value.trim(),performer=artist.value.trim();
      updateFallback();if(song.length<3){section.hidden=true;return;}
      section.hidden=false;cards.replaceChildren();stage.replaceChildren();
      const checked = window.AilleursMusicVideos?.find(song, performer) || [];
      if(checked.length){status.textContent='';render(checked);return;}
      if(unavailable){status.textContent='Automatic video search is unavailable right now. You can check YouTube or Bilibili and paste the exact video link.';return;}
      status.textContent='Finding YouTube versions…';
      try{
        const result=await client.functions.invoke('song-video-search',{body:{title:song,artist:performer}});
        if(current!==sequence||title.value.trim()!==song||artist.value.trim()!==performer)return;
        if(result.error||!result.data?.available){if(result.data?.reason==='unconfigured')unavailable=true;status.textContent='Video choices are unavailable right now. You can still check YouTube and paste the exact link.';return;}
        const items=Array.isArray(result.data.items)?result.data.items:[];
        status.textContent=items.length?'Check the title and channel, then choose the right version.':'No embeddable videos were returned. Check YouTube directly.';
        render(items);
      }catch{if(current===sequence)status.textContent='Could not search YouTube right now. Paste a checked link instead.';}
    };
    const schedule=()=>{clearTimeout(timer);++sequence;updateFallback();if(title.value.trim().length<3){section.hidden=true;return;}section.hidden=false;status.textContent='Checking video versions…';timer=setTimeout(()=>void search(),1450);};
    title.addEventListener('input',schedule);artist.addEventListener('input',schedule);
    form.addEventListener('daytone:catalog-found',schedule);form.addEventListener('daytone:recording-selected',schedule);
    form.addEventListener('reset',()=>{clearTimeout(timer);++sequence;cards.replaceChildren();stage.replaceChildren();section.hidden=true;});
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const song=document.getElementById('upload-form');
    const linkReader=setup(song,song?.elements.url,song?.elements.title,song?.elements.artist);
    setupTitleSearch(song,linkReader);
    setupQuickImport(song);
    setupSourcePreview(song);
    setupSourcePreview(song,'video_url');
    setupVideoSuggestions(song);
    if(song?.elements.video_url){
      const preview=document.createElement('div');preview.className='youtube-publish-preview';preview.hidden=true;
      preview.innerHTML='<img alt="Selected YouTube video thumbnail"><div><strong>Check this video version</strong><p>This is the video listeners will see.</p><label><input type="checkbox" name="confirm_video"> Yes, this is the version I want to share</label></div>';
      song.elements.video_url.closest('label').after(preview);
      let lastVideo='';
      const update=()=>{
        const value=song.elements.video_url.value.trim()||song.elements.url.value.trim(),id=typeof youtubeVideoId==='function'?youtubeVideoId(value):'',embeddable=typeof musicEmbed==='function'?musicEmbed(value)?.classList.contains('video-player'):false;
        preview.hidden=!embeddable;if(value!==lastVideo)preview.querySelector('input').checked=false;lastVideo=value;
        if(id)preview.querySelector('img').src='https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';
        else preview.querySelector('img').removeAttribute('src');
        preview.querySelector('img').hidden=!id;
      };
      for(const input of [song.elements.url,song.elements.video_url]){input.addEventListener('input',update);input.addEventListener('change',update);}
      song.addEventListener('reset',()=>setTimeout(update,0));
    }
    const playlist=document.getElementById('playlist-form');
    setup(playlist,playlist?.elements.source_url,playlist?.elements.title,null,true);
  });
})();
