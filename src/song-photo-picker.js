/* Optional Commons photographs. Every suggestion keeps its file-page attribution. */
(() => {
  const normalize=value=>String(value||'').normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const plain=value=>new DOMParser().parseFromString(String(value||''),'text/html').body.textContent.trim();
  const safeImage=value=>{try{const url=new URL(value);return url.protocol==='https:'&&(['upload.wikimedia.org','thumb.wikimedia.org'].includes(url.hostname))?url.href:'';}catch{return '';}};
  const safePage=value=>{try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='commons.wikimedia.org'?url.href:'';}catch{return '';}};
  async function searchName(artist){
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
      const license=plain(meta.LicenseShortName?.value),credit=plain(meta.Artist?.value||meta.Credit?.value).split(/\n+/)[0].trim().slice(0,90);
      const categories=String(meta.Categories?.value||'').split('|').map(normalize);
      const identified=categories.some(category=>category===name||category.startsWith(name+' ')||category.endsWith(' of '+name));
      const nonSubject=/(?:\bhouse\b|\bavenue\b|\bstreet\b|\broad\b|\bplaque\b|\bmemorial\b|\bstatue\b|\bgrave\b|\bmural\b|\bposter\b|\blogo\b)/i.test(title);
      if(!src||!pageUrl||!license||!file?.mime?.startsWith('image/')||!normalize(title).includes(name)||!identified||nonSubject||seen.has(pageUrl)||/accuracy disputes|logos|signatures|in art|album covers/i.test(meta.Categories?.value||''))return [];
      const rawDescription=plain(meta.ImageDescription?.value);
      const description=/collectie|archief|reportage|file description/i.test(rawDescription)?'':rawDescription.split(/\n+/)[0].trim().slice(0,180);
      const eventKey=normalize(title.replace(/\s*(?:[(_-]\s*)?(?:0?[1-9]|1[0-9])\)?$/,'')||title);
      seen.add(pageUrl);return [{src,pageUrl,title:description&&normalize(description).includes(name)?description:title,credit:credit||'Wikimedia Commons',license,eventKey}];
    }).slice(0,12);
  }
  async function search(artist){
    const names=normalize(artist)==='madvillain'?['MF Doom','Madlib']:[artist];
    const matches=await Promise.allSettled(names.map(searchName));
    const groups=matches.map(result=>result.status==='fulfilled'?result.value:[]),seen=new Set(),result=[];
    for(let i=0;i<12;i++)for(const group of groups){const item=group[i];if(item&&!seen.has(item.pageUrl)){seen.add(item.pageUrl);result.push(item);}}
    return result.slice(0,12);
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
      grid.replaceChildren();chosen=[];
      const captions=new Set(),events=new Set();
      for(const item of items){const key=normalize(item.title),event=item.eventKey||key;if(!captions.has(key)&&!events.has(event)){chosen.push(item);captions.add(key);events.add(event);}if(chosen.length===4)break;}
      status.textContent=items.length?items.length+' sourced photos found'+(normalize(artist.value)==='madvillain'?' of MF DOOM and Madlib, the members of Madvillain':'')+' · '+chosen.length+' selected. Review or change them below.':'No clearly named, credited Commons photographs found. You can publish without extras.';
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
    form.addEventListener('submit',()=>{form.dataset.mediaGallery=JSON.stringify(chosen.slice(0,6).map(({eventKey,...item})=>item));},{capture:true});
    status.textContent='Choose a recording or enter an artist to find photos.';
  }
  document.addEventListener('DOMContentLoaded',setup);
  window.AilleursCommonsPhotos={search};
})();
