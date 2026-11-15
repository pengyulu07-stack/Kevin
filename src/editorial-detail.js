// Source-led details for the dated editorial cards. Community posts remain separate.
(() => {
  const dialog=document.createElement('dialog');dialog.className='editorial-detail';dialog.setAttribute('aria-label','Work details');document.body.append(dialog);
  let generation=0;
  const zh=()=>window.DaytoneLanguage?.get()==='zh';
  const t=(cn,en)=>zh()?cn:en;
  const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el;};
  const link=(label,url,cls='')=>{const a=make('a',cls,label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
  const textValue=v=>typeof v==='string'?v:typeof v?.value==='string'?v.value:'';
  const sourceName=room=>({music:'Apple Music',film:'Film source',art:'Cleveland Museum of Art',books:'Open Library'})[room];
  const search=(query,site)=>'https://www.google.com/search?q='+encodeURIComponent((site?'site:'+site+' ':'')+query);
  const titleOnly=print=>print.title.split(' · ')[0];
  const paragraph=(root,content)=>{if(content)root.append(make('p','',content));};
  const section=(root,title)=>{const wrap=make('section','editorial-detail-section');wrap.append(make('h3','',title));root.append(wrap);return wrap;};
  const addSource=(root,label,url)=>root.append(link(label+' ↗',url,'editorial-source-link'));
  function addImage(root,src,alt){const img=make('img');img.src=src;img.alt=alt;img.loading='lazy';img.onerror=()=>img.remove();root.append(img);}
  async function copy(text,button){try{await navigator.clipboard.writeText(text);button.textContent=t('已复制','Copied');setTimeout(()=>button.textContent=t('复制歌名','Copy title'),1800);}catch{button.textContent=t('复制失败','Could not copy');}}
  async function albumContent(print,body,id){
    const albumId=print.source.match(/\/album\/[^/]+\/(\d+)/)?.[1];
    const context=section(body,t('专辑资料','About this album'));
    paragraph(context,t('曲目、发行日期和风格以唱片目录为准。封面构思尚无可靠来源时，这里不会代作者解释。','Tracks, release date and genre come from the album catalog. Cover intentions are shown only when a source can support them.'));
    addSource(context,t('查看专辑记录','Album record'),print.source);
    const tracks=section(body,t('曲目','Tracks'));
    if(!albumId){paragraph(tracks,t('暂无可读取的曲目目录。','No track listing is available.'));return;}
    paragraph(tracks,t('正在读取曲目…','Loading tracks…'));
    try{
      const response=await fetch('https://itunes.apple.com/lookup?id='+albumId+'&entity=song&limit=200&country=US');
      if(!response.ok)throw Error('catalog');const data=await response.json();if(id!==generation)return;
      tracks.replaceChildren(make('h3','',t('曲目','Tracks')));
      const album=data.results?.find(x=>x.wrapperType==='collection');
      if(album){const meta=[album.releaseDate?.slice(0,4),album.primaryGenreName,album.trackCount&&album.trackCount+' tracks'].filter(Boolean).join(' · ');context.append(make('p','editorial-meta',meta));}
      const songs=(data.results||[]).filter(x=>x.wrapperType==='track'&&x.collectionId==albumId).sort((a,b)=>(a.discNumber||0)-(b.discNumber||0)||(a.trackNumber||0)-(b.trackNumber||0));
      if(!songs.length){paragraph(tracks,t('唱片目录暂未返回曲目。','The catalog did not return tracks.'));return;}
      const list=make('ol','editorial-track-list');for(const song of songs){const row=make('li');row.append(make('strong','',song.trackName));const actions=make('span');const copyButton=make('button','',t('复制歌名','Copy title'));copyButton.type='button';copyButton.addEventListener('click',()=>copy(song.trackName+' — '+(song.artistName||print.artist),copyButton));actions.append(copyButton,link('YouTube ↗','https://www.youtube.com/results?search_query='+encodeURIComponent(song.trackName+' '+(song.artistName||print.artist))));row.append(actions);list.append(row);}tracks.append(list);
    }catch{if(id===generation){tracks.replaceChildren(make('h3','',t('曲目','Tracks')));paragraph(tracks,t('暂时无法读取曲目，请查看专辑目录。','Tracks are temporarily unavailable; open the album catalog.'));addSource(tracks,'Apple Music',print.source);}}
  }
  async function artContent(print,body,id){
    const context=section(body,t('作品与创作背景','The work and its context'));
    paragraph(context,t('正在读取馆藏说明…','Loading museum record…'));
    try{const accession=print.source.split('/art/')[1];const response=await fetch('https://openaccess-api.clevelandart.org/api/artworks/?accession_number='+encodeURIComponent(accession));if(!response.ok)throw Error('museum');const json=await response.json();if(id!==generation)return;const work=json.data?.find(x=>x.url===print.source)||json.data?.[0];context.replaceChildren(make('h3','',t('作品与创作背景','The work and its context')));if(!work)throw Error('missing');
      paragraph(context,[work.creation_date,work.technique,work.culture?.[0]].filter(Boolean).join(' · '));const desc=textValue(work.wall_description)||textValue(work.artlens_description)||textValue(work.description);if(desc)paragraph(context,desc.slice(0,700));else paragraph(context,t('馆藏未提供可核对的创作过程说明。','The museum record has no verified account of the making process.'));addSource(context,t('查看完整馆藏记录','Full museum record'),print.source);
      const extra=section(body,t('更多图像与资料','More images and context'));const images=[work.images?.web?.url,work.images?.print?.url,work.images?.full?.url].filter(Boolean);const unique=[...new Set(images)];if(unique.length>1){const gallery=make('div','editorial-extra-images');for(const src of unique.slice(1,3))addImage(gallery,src,print.title);extra.append(gallery);}paragraph(extra,t('同一作品的不同图像尺寸不代表创作过程。更多手稿与相关作品请从馆藏记录继续查找。','Additional sizes of this image are not process photos. Follow the museum record for related works and studies.'));addSource(extra,t('查找相关作品','Find related works'),search(print.artist+' '+titleOnly(print),'clevelandart.org'));
    }catch{if(id===generation){context.replaceChildren(make('h3','',t('作品与创作背景','The work and its context')));paragraph(context,t('馆藏说明暂时无法读取。','The museum record is temporarily unavailable.'));addSource(context,t('查看馆藏记录','Museum record'),print.source);}}
  }
  async function bookContent(print,body,id){
    const context=section(body,t('这本书','About the book'));paragraph(context,t('正在读取书目…','Loading book record…'));
    try{const key=new URL(print.source).pathname;const response=await fetch('https://openlibrary.org'+key+'.json');if(!response.ok)throw Error('book');const work=await response.json();if(id!==generation)return;context.replaceChildren(make('h3','',t('这本书','About the book')));const desc=textValue(work.description);if(desc)paragraph(context,desc.slice(0,550));else paragraph(context,t('这条书目没有简介。','This catalog record has no description.'));addSource(context,t('版本、借阅与馆藏','Editions, reading and libraries'),print.source);
      const reading=section(body,t('阅读与作者','Read and explore'));paragraph(reading,t('不同版本的试读或借阅情况请以书目页为准。只有得到授权的正文，才会在这里直接展开。','Preview and borrowing availability depend on the edition. Full text appears here only when its rights are clear.'));addSource(reading,t('查找作者资料','Find the author'),search(print.artist+' author books','openlibrary.org'));addSource(reading,t('查找书评','Find reviews'),search(titleOnly(print)+' '+print.artist+' review','theguardian.com'));
    }catch{if(id===generation){context.replaceChildren(make('h3','',t('这本书','About the book')));paragraph(context,t('书目暂时无法读取。','The catalog record is temporarily unavailable.'));addSource(context,'Open Library',print.source);}}
  }
  function filmContent(print,body){const context=section(body,t('影片与主创','Film and creators'));paragraph(context,t('这是影片的海报或剧照。拍摄背景和主创信息请从影片资料核对；没有来源的幕后故事不会写在这里。','This is a poster or film frame. Production accounts and credits should be checked against the linked film record.'));addSource(context,t('查看影片资料','Film record'),print.source);const images=section(body,t('画面与拍摄资料','Frames and production'));const gallery=make('div','editorial-extra-images');addImage(gallery,print.src,print.title);images.append(gallery);paragraph(images,t('目前只有这张已核对来源的图像；更多剧照和幕后照片可从下方继续查找。','This is the source-checked image currently available. Explore more frames and production photos below.'));addSource(images,t('查找更多剧照','Find more film stills'),search(titleOnly(print)+' film stills'));addSource(images,t('查找幕后照片','Find production photos'),search(titleOnly(print)+' behind the scenes'));}
  function open(print,room){const id=++generation;dialog.replaceChildren();const header=make('header','editorial-detail-header');const close=make('button','editorial-close','×');close.type='button';close.setAttribute('aria-label',t('关闭','Close'));close.addEventListener('click',()=>dialog.close());header.append(make('small','',('AILLEURS / '+room).toUpperCase()),close);dialog.append(header);const hero=make('div','editorial-detail-hero');const picture=make('div','editorial-detail-cover');addImage(picture,print.src,print.title);const info=make('div','editorial-detail-intro');info.append(make('h2','',titleOnly(print)),make('p','',print.artist||sourceName(room)));const links=make('div','editorial-detail-links');links.append(link(sourceName(room)+' ↗',print.source));if(room==='music')links.append(link('YouTube ↗','https://www.youtube.com/results?search_query='+encodeURIComponent(titleOnly(print)+' '+print.artist)));info.append(links);hero.append(picture,info);dialog.append(hero);const body=make('div','editorial-detail-body');dialog.append(body);dialog.showModal();if(room==='music')void albumContent(print,body,id);else if(room==='art')void artContent(print,body,id);else if(room==='books')void bookContent(print,body,id);else filmContent(print,body);
    const discussion=section(body,t('继续了解','Continue exploring'));addSource(discussion,t('查找有出处的评论','Find published criticism'),search(titleOnly(print)+' '+(print.artist||'')+' review'));
  }
  dialog.addEventListener('close',()=>generation++);
  window.AilleursEditorial={open};
})();
