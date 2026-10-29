/* Read public platform metadata in the visitor's browser; always let the author review it. */
(() => {
  function metadataUrl(value) {
    try {
      const url = new URL(value.trim());
      if (url.protocol !== 'https:') return null;
      if (url.hostname === 'open.spotify.com' && /^\/(track|album|playlist)\/[A-Za-z0-9]{22}\/?$/.test(url.pathname))
        return {platform:'Spotify', endpoint:'https://open.spotify.com/oembed?url='+encodeURIComponent(url.origin+url.pathname)};
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
    const row=data.results?.find(item=>String(item.trackId||item.collectionId)===target.id)||data.results?.[0];
    if(!row)return null;
    return {title:row.trackName||row.collectionName||'',artist:row.artistName||'',album:row.collectionName||'',art:(row.artworkUrl100||'').replace(/100x100bb/,'300x300bb'),url:row.trackViewUrl||'',platform:target.platform};
  }
  function setupTitleSearch(form,linkReader){
    const title=form?.elements.title,artist=form?.elements.artist;if(!title||!artist)return;
    const button=document.createElement('button');button.type='button';button.className='link-read-button';button.textContent='Find artist & recording ↗';
    const status=document.createElement('small');status.className='link-read-status';status.setAttribute('role','status');
    const results=document.createElement('div');results.className='song-lookup-results';results.setAttribute('aria-label','Matching recordings');
    title.closest('label').after(button,status,results);
    let timer,sequence=0,suggestedUrl='';
    const select=(row,automatic)=>{
      if(!automatic)title.value=row.trackName;
      if(!automatic||!artist.value.trim())artist.value=row.artistName;
      const link=form.elements.url,selected=form.querySelector('input[name="source"]:checked');
      if(link && (!link.value.trim()||link.value===suggestedUrl) && selected?.value!=='file'){
        link.value=row.trackViewUrl;suggestedUrl=row.trackViewUrl;const radio=form.querySelector('input[name="source"][value="link"]');radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
      }
      status.replaceChildren(document.createTextNode((automatic?'Matched: ':'Selected: ')+row.trackName+' · '+row.artistName+(automatic?'. Choose another version below if needed. ':'. Check it before publishing. ')));
      const source=document.createElement('a');source.href=row.trackViewUrl;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Open on Apple Music ↗';status.append(source);
      if(!automatic)results.replaceChildren();
    };
    title.addEventListener('input',()=>{
      clearTimeout(timer);++sequence;
      const link=form.elements.url;if(suggestedUrl&&link?.value===suggestedUrl){link.value='';suggestedUrl='';const radio=form.querySelector('input[name="source"][value="none"]');radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}
      const value=title.value.trim();if(value.length<3||/^https:\/\//i.test(value))return;
      timer=setTimeout(()=>void search(),950);
    });
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
      button.disabled=true;status.textContent='Searching recordings…';
      try{
        const url=new URL('https://itunes.apple.com/search');url.search=new URLSearchParams({term:query,media:'music',entity:'song',country:'us',limit:'8'}).toString();
        const response=await fetch(url,{mode:'cors',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('Search unavailable');
        const data=await response.json();if(current!==sequence)return;
        const normal=value=>String(value||'').normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
        const wantedTitle=normal(title.value),wantedArtist=normal(artist.value);
        const score=row=>{const foundTitle=normal(row.trackName),foundArtist=normal(row.artistName);return (foundTitle===wantedTitle?6:foundTitle.includes(wantedTitle)?2:0)+(wantedArtist?(foundArtist===wantedArtist?5:foundArtist.includes(wantedArtist)?2:0):0);};
        const tracks=(data.results||[]).filter(row=>row.kind==='song'&&row.trackName&&row.artistName&&row.trackViewUrl).sort((a,b)=>score(b)-score(a)).slice(0,6);
        if(!tracks.length){status.textContent='No clear match. Keep your own title and artist, or paste a music link.';return;}
        const best=tracks[0];if(normal(best.trackName)===wantedTitle)select(best,true);
        else status.textContent='Choose the right recording. Your title can also stay as written.';
        for(const row of tracks){
          const option=document.createElement('button');option.type='button';option.className='song-lookup-option';
          const words=document.createElement('span');words.append(document.createElement('strong'),document.createElement('small'));words.firstChild.textContent=row.trackName;words.lastChild.textContent=[row.artistName,row.collectionName].filter(Boolean).join(' · ');option.append(words);
          option.addEventListener('click',()=>select(row,false));results.append(option);
        }
      }catch{if(current===sequence)status.textContent='Could not search right now. You can publish with just the title.';}
      finally{if(current===sequence)button.disabled=false;}
    }
    button.addEventListener('click',()=>void search());
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
        if(!result){status.textContent='Automatic details are available for public Spotify and Apple Music links. You can still enter the title yourself and keep this link.';return;}
        if(result.title)title.value=result.title;
        if(artist&&result.artist)artist.value=result.artist;
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
    const playlist=document.getElementById('playlist-form');
    setup(playlist,playlist?.elements.source_url,playlist?.elements.title,null,true);
  });
})();
