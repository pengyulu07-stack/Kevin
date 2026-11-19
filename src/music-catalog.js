/* Catalog metadata is bundled; preview media always streams from Apple's servers. */
(() => {
  const norm=value=>window.AilleursMusicSearch?.normal(value)||String(value||'').normalize('NFKC').toLocaleLowerCase().trim();
  const supplement=fetch(new URL('music-search-supplement.json',document.baseURI)).then(r=>r.ok?r.json():[]).catch(()=>[]);
  let manifest;
  const ready=fetch(new URL('music-catalog.json?v=20261119h2',document.baseURI)).then(r=>{if(!r.ok)throw Error('catalog');return r.json();}).then(data=>{manifest=data;return data;}).catch(()=>null);
  const albumFor=row=>manifest?.albums.find(album=>String(album.id)===String(row.collectionId));
  function asSong(row){const album=albumFor(row);return {id:'catalog-'+row.trackId,title:row.trackName,artist:row.artistName,album:row.collectionName,source_url:row.trackViewUrl,previewUrl:row.previewUrl,catalogCover:album?.cover||row.artworkUrl100,nickname:'AILLEURS',catalog:true,print:album&&{title:album.title,artist:album.artist,src:album.cover,source:album.source}};}
  const active=day=>{
    if(!manifest||day<'2026-11-18')return [];
    const elapsed=Math.floor((Date.parse(day+'T12:00:00Z')-Date.parse('2026-11-18T12:00:00Z'))/86400000);
    const rows=manifest.tracks,start=((elapsed*2)%rows.length+rows.length)%rows.length;
    return Array.from({length:Math.min(100,rows.length)},(_,i)=>rows[(start+i)%rows.length]);
  };
  function open(row){const album=albumFor(row);if(album)window.AilleursEditorial?.open({title:album.title,artist:album.artist,src:album.cover,source:album.source},'music');}
  async function mount(host,day){
    const data=await ready;if(!data||!host.isConnected)return;
    const zh=window.DaytoneLanguage?.get()==='zh',section=document.createElement('section');section.className='music-recordings';
    const head=document.createElement('div');head.className='music-recordings-head';
    const title=document.createElement('h3');title.textContent=zh?'继续听':'Keep listening';
    const controls=document.createElement('div'),playAll=document.createElement('button'),search=document.createElement('input');search.type='search';search.placeholder=zh?'歌曲、歌手、专辑':'Song, artist or album';search.setAttribute('aria-label',search.placeholder);
    const more=document.createElement('button');more.type='button';more.className='recordings-more';more.textContent=zh?'显示更多':'Show more';
    const grid=document.createElement('div');grid.className='music-recordings-grid';
    let limit=12,currentRows=[];
    const render=()=>{
      const q=norm(search.value),rows=(q?[...new Map(data.albums.flatMap(album=>album.tracks).map(row=>[row.trackId,row])).values()]:active(day)).filter(row=>!q||norm([row.trackName,row.artistName,row.collectionName].join(' ')).includes(q));
      currentRows=rows;playAll.disabled=!rows.length;grid.replaceChildren();
      for(const row of rows.slice(0,limit)){
        const song=asSong(row),card=document.createElement('article');card.className='music-recording-card';
        const art=document.createElement('button');art.type='button';art.className='music-recording-art';art.setAttribute('aria-label',(zh?'试听 ':'Preview ')+song.title);
        const img=document.createElement('img');img.src=song.catalogCover;img.alt=song.album;img.loading='lazy';
        const play=document.createElement('span');play.textContent='▶';art.append(img,play);art.addEventListener('click',()=>window.DaytoneListen?.open(song));
        const detail=document.createElement('button');detail.type='button';detail.className='music-recording-info';detail.append(document.createElement('strong'),document.createElement('small'));detail.firstChild.textContent=song.title;detail.lastChild.textContent=song.artist;detail.addEventListener('click',()=>open(row));
        const store=document.createElement('a');store.href=row.trackViewUrl;store.target='_blank';store.rel='noopener noreferrer';store.className='recording-store';store.textContent='iTunes';store.setAttribute('aria-label','View '+row.trackName+' on iTunes');
        const read=document.createElement('button');read.type='button';read.className='recording-details';read.textContent=zh?'专辑详情 →':'Album details →';read.addEventListener('click',()=>open(row));card.append(art,detail,read,store);grid.append(card);
      }
      more.hidden=rows.length<=limit;
      if(!rows.length){const empty=document.createElement('p');empty.textContent=zh?'没有找到相符的歌曲。':'No matching recordings.';grid.append(empty);}
    };
    more.addEventListener('click',()=>{limit+=12;render();});search.addEventListener('input',()=>{limit=12;render();});playAll.type='button';playAll.textContent=zh?'全部试听':'Play all';playAll.className='recordings-play-all';playAll.addEventListener('click',()=>window.DaytoneListen?.playQueue(currentRows.map(asSong)));controls.append(search,playAll);head.append(title,controls);section.append(head,grid,more);
    const credit=document.createElement('small');credit.className='recording-credit';credit.textContent=zh?'30 秒试听由 iTunes 提供。':'30-second previews provided courtesy of iTunes.';section.append(credit);host.append(section);render();
  }
  window.AilleursCatalog={ready,active,asSong,open,mount,album:async id=>{await ready;return manifest?.albums.find(a=>a.id===String(id));},search:async(title,artist)=>{await Promise.all([ready,window.AilleursMusicSearch?.ready]);const extra=await supplement;const wanted=norm(title),performer=norm(artist);return [...(manifest?.albums.flatMap(a=>a.tracks)||[]),...extra].filter(row=>norm(row.trackName).includes(wanted)&&(!performer||norm(row.artistName).includes(performer))).slice(0,10);},coverFor:song=>{const id=String(song?.source_url||'').match(/[?&]i=(\d+)/)?.[1];return manifest?.albums.find(album=>album.tracks.some(row=>String(row.trackId)===id))?.cover||'';}};
})();
