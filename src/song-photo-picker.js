/* Optional Commons photographs. Every suggestion keeps its file-page attribution. */
(() => {
  const normalize=value=>String(value||'').normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const plain=value=>{const element=document.createElement('div');element.innerHTML=String(value||'');return element.textContent.trim();};
  const safeImage=value=>{try{const url=new URL(value);return url.protocol==='https:'&&(['upload.wikimedia.org','commons.wikimedia.org'].includes(url.hostname))?url.href:'';}catch{return '';}};
  const safePage=value=>{try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='commons.wikimedia.org'?url.href:'';}catch{return '';}};
  async function search(artist){
    const endpoint=new URL('https://commons.wikimedia.org/w/api.php');
    endpoint.search=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrsearch:'intitle:"'+artist.replaceAll('"','')+'" filetype:bitmap',gsrnamespace:'6',gsrlimit:'35',prop:'imageinfo',iiprop:'url|extmetadata|mime',iiurlwidth:'480'}).toString();
    const response=await fetch(endpoint,{mode:'cors',signal:AbortSignal.timeout(8500)});
    if(!response.ok)throw Error('Commons unavailable');
    const data=await response.json();
    const name=normalize(artist),seen=new Set();
    return Object.values(data.query?.pages||{}).sort((a,b)=>(a.index||0)-(b.index||0)).flatMap(page=>{
      const file=page.imageinfo?.[0],meta=file?.extmetadata||{};
      const title=String(page.title||'').replace(/^File:/i,'').replace(/\.[^.]+$/,'').replaceAll('_',' ');
      const src=safeImage(file?.thumburl||''),pageUrl=safePage(file?.descriptionurl||'');
      const license=plain(meta.LicenseShortName?.value),credit=plain(meta.Artist?.value||meta.Credit?.value).slice(0,160);
      if(!src||!pageUrl||!license||!file?.mime?.startsWith('image/')||!normalize(title).includes(name)||seen.has(pageUrl))return [];
      seen.add(pageUrl);return [{src,pageUrl,title,credit:credit||'Wikimedia Commons',license}];
    }).slice(0,12);
  }
  function setup(){
    const form=document.getElementById('upload-form'),artist=form?.elements.artist;
    if(!artist)return;
    const section=document.createElement('section');section.className='song-photo-picker';
    const heading=document.createElement('h3');heading.textContent='Related photographs';
    const intro=document.createElement('p');intro.textContent='Choose photos of the artist or recording. Four matching Commons photos are selected by default when available; check each image before publishing.';
    const status=document.createElement('p');status.className='song-photo-status';status.setAttribute('role','status');
    const grid=document.createElement('div');grid.className='song-photo-grid';
    const refresh=document.createElement('button');refresh.type='button';refresh.className='outline-button';refresh.textContent='Find photographs';
    section.append(heading,intro,refresh,status,grid);
    form.elements.cover.closest('label').after(section);
    let timer,sequence=0,lastArtist='',chosen=[];
    const render=items=>{
      grid.replaceChildren();chosen=items.slice(0,4);
      status.textContent=items.length?items.length+' sourced photos found · '+chosen.length+' selected. Review or change them below.':'No clearly named, credited Commons photographs found. You can publish without extras.';
      for(const item of items){
        const label=document.createElement('label');label.className='song-photo-option';
        const check=document.createElement('input');check.type='checkbox';check.checked=chosen.includes(item);check.setAttribute('aria-label','Include '+item.title);
        const image=document.createElement('img');image.src=item.src;image.alt=item.title;image.loading='lazy';
        const caption=document.createElement('span');caption.textContent=item.title;
        const credit=document.createElement('small');credit.textContent=item.credit+' · '+item.license;
        const source=document.createElement('a');source.href=item.pageUrl;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Source ↗';
        source.addEventListener('click',event=>event.stopPropagation());
        check.addEventListener('change',()=>{if(check.checked){if(chosen.length>=6){check.checked=false;status.textContent='Choose up to six photos.';return;}chosen.push(item);}else chosen=chosen.filter(row=>row!==item);status.textContent=chosen.length+' photos selected.';});
        image.addEventListener('error',()=>{if(check.checked){chosen=chosen.filter(row=>row!==item);}label.remove();status.textContent=chosen.length+' usable photos selected.';},{once:true});
        label.append(check,image,caption,credit,source);grid.append(label);
      }
    };
    const run=async()=>{
      const name=artist.value.trim(),current=++sequence;if(name.length<2){grid.replaceChildren();chosen=[];status.textContent='Choose a recording or enter an artist to find photos.';return;}
      if(name===lastArtist&&grid.childElementCount)return;
      lastArtist=name;grid.replaceChildren();chosen=[];refresh.disabled=true;status.textContent='Looking for credited photos of '+name+'…';
      try{const items=await search(name);if(current===sequence&&name===artist.value.trim())render(items);}
      catch{if(current===sequence)status.textContent='Photo search is unavailable. You can still share the song.';}
      finally{if(current===sequence)refresh.disabled=false;}
    };
    const schedule=()=>{clearTimeout(timer);++sequence;lastArtist='';grid.replaceChildren();chosen=[];status.textContent='Checking related photos…';timer=setTimeout(()=>void run(),1000);};
    artist.addEventListener('input',schedule);form.addEventListener('daytone:recording-selected',schedule);form.addEventListener('daytone:catalog-found',schedule);
    refresh.addEventListener('click',()=>{lastArtist='';void run();});
    form.addEventListener('reset',()=>{clearTimeout(timer);++sequence;lastArtist='';chosen=[];grid.replaceChildren();status.textContent='';});
    form.addEventListener('submit',()=>{form.dataset.mediaGallery=JSON.stringify(chosen.slice(0,6));},{capture:true});
    status.textContent='Choose a recording or enter an artist to find photos.';
  }
  document.addEventListener('DOMContentLoaded',setup);
})();
