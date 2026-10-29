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
    return {title:row.trackName||row.collectionName||'',artist:row.artistName||'',art:(row.artworkUrl100||'').replace(/100x100bb/,'300x300bb'),platform:target.platform};
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
        if(result.art){const image=document.createElement('img');image.src=result.art;image.alt='Cover preview from '+result.platform;image.loading='lazy';image.className='link-cover-preview';status.append(image);}
        if(playlist)status.append(document.createTextNode(' Add or paste the track names below; the platform does not provide a readable full list here.'));
      }catch{status.textContent='Could not read details from this link. Enter the title manually; the original link will still work.';}
      finally{button.disabled=false;}
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const song=document.getElementById('upload-form');
    setup(song,song?.elements.url,song?.elements.title,song?.elements.artist);
    const playlist=document.getElementById('playlist-form');
    setup(playlist,playlist?.elements.source_url,playlist?.elements.title,null,true);
  });
})();
