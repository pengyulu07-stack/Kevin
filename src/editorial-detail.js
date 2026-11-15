// Source-led details for the dated editorial cards. Community posts remain separate.
(() => {
  const dialog=document.createElement('dialog');dialog.className='editorial-detail';dialog.setAttribute('aria-label','Work details');document.body.append(dialog);
  let generation=0;
  const zh=()=>window.DaytoneLanguage?.get()==='zh';
  const t=(cn,en)=>zh()?cn:en;
  const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el;};
  const link=(label,url,cls='')=>{const a=make('a',cls,label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
  const textValue=v=>typeof v==='string'?v:typeof v?.value==='string'?v.value:'';
  const sourceName=room=>({music:'Apple Music',film:t('海报／截图出处','Poster or frame source'),art:'Cleveland Museum of Art',books:'Open Library'})[room];
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
    if(albumId==='1558162066'){
      paragraph(context,t('这张封面由 Jason Jägel 绘制、Jeff Jank 参与设计。唱片的食物意象从名字延伸到插画和曲名；创作者对原版封面的经过，可以读 Stones Throw 的记录。','Jason Jägel painted the cover, with Jeff Jank involved in its design. Food runs through the artwork, title and track names; Stones Throw documents how the original sleeve was made.'));
      addSource(context,t('封面创作记录','Cover story'),'https://www.stonesthrow.com/news/mf-doom-hoe-cakes-poster/');
      addSource(context,t('阅读乐评','Read a review'),'https://pitchfork.com/reviews/albums/5255-mmfood/');
    }else paragraph(context,t('曲目和发行资料来自唱片目录。','Track and release details from the album catalog.'));
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
    const accession=print.source.split('/art/')[1],cached=window.AilleursArtNotes?.[accession];
    if(cached){
      paragraph(context,[cached.creation_date,cached.technique,cached.culture].filter(Boolean).join(' · '));
      paragraph(context,cached.description||t('馆藏未提供作品说明。','The museum record has no description.'));
      addSource(context,t('查看完整馆藏记录','Full museum record'),print.source);
      const extra=section(body,t('继续查找','Explore further'));
      addSource(extra,t('同一艺术家的其他作品','More by this artist'),search(print.artist+' artworks','clevelandart.org'));
      return;
    }
    paragraph(context,t('正在读取馆藏说明…','Loading museum record…'));
    try{const accession=print.source.split('/art/')[1];const response=await fetch('https://openaccess-api.clevelandart.org/api/artworks/?accession_number='+encodeURIComponent(accession));if(!response.ok)throw Error('museum');const json=await response.json();if(id!==generation)return;const work=json.data?.find(x=>x.url===print.source)||json.data?.[0];context.replaceChildren(make('h3','',t('作品与创作背景','The work and its context')));if(!work)throw Error('missing');
      paragraph(context,[work.creation_date,work.technique,work.culture?.[0]].filter(Boolean).join(' · '));const desc=textValue(work.wall_description)||textValue(work.artlens_description)||textValue(work.description);if(desc)paragraph(context,desc.slice(0,700));else paragraph(context,t('馆藏未提供可核对的创作过程说明。','The museum record has no verified account of the making process.'));addSource(context,t('查看完整馆藏记录','Full museum record'),print.source);
      const extra=section(body,t('更多图像与资料','More images and context'));const images=[work.images?.web?.url,work.images?.print?.url,work.images?.full?.url].filter(Boolean);const unique=[...new Set(images)];if(unique.length>1){const gallery=make('div','editorial-extra-images');for(const src of unique.slice(1,3))addImage(gallery,src,print.title);extra.append(gallery);}paragraph(extra,t('同一作品的不同图像尺寸不代表创作过程。更多手稿与相关作品请从馆藏记录继续查找。','Additional sizes of this image are not process photos. Follow the museum record for related works and studies.'));addSource(extra,t('查找相关作品','Find related works'),search(print.artist+' '+titleOnly(print),'clevelandart.org'));
    }catch{if(id===generation){context.replaceChildren(make('h3','',t('作品与创作背景','The work and its context')));paragraph(context,t('馆藏说明暂时无法读取。','The museum record is temporarily unavailable.'));addSource(context,t('查看馆藏记录','Museum record'),print.source);}}
  }
  async function bookContent(print,body,id){
    const context=section(body,t('这本书','About the book'));paragraph(context,t('正在读取书目…','Loading book record…'));const reading=section(body,t('阅读与作者','Read and explore'));
    try{const key=new URL(print.source).pathname;const response=await fetch('https://openlibrary.org'+key+'.json');if(!response.ok)throw Error('book');const work=await response.json();if(id!==generation)return;context.replaceChildren(make('h3','',t('这本书','About the book')));const desc=textValue(work.description).replace(/\*\*/g,'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1');if(desc)paragraph(context,desc.slice(0,550));else paragraph(context,t('这条书目没有简介。','This catalog record has no description.'));addSource(context,t('版本、借阅与馆藏','Editions, reading and libraries'),print.source);
      if(titleOnly(print)==='The Picture of Dorian Gray'){const excerpt=make('details','editorial-book-excerpt');excerpt.append(make('summary','',t('展开一小段原文','Read a short passage')));excerpt.append(make('blockquote','', 'There is no such thing as a moral or an immoral book. Books are well written, or badly written.'));addSource(excerpt,t('在古腾堡计划继续阅读','Read the original at Project Gutenberg'),'https://www.gutenberg.org/ebooks/174');reading.append(excerpt);}else paragraph(reading,t('不同版本的试读或借阅情况请以书目页为准。只有得到授权的正文，才会在这里直接展开。','Preview and borrowing availability depend on the edition. Full text appears here only when its rights are clear.'));addSource(reading,t('查找作者资料','Find the author'),search(print.artist+' author books','openlibrary.org'));addSource(reading,t('查找书评','Find reviews'),search(titleOnly(print)+' '+print.artist+' review','theguardian.com'));
    }catch{if(id===generation){context.replaceChildren(make('h3','',t('这本书','About the book')));paragraph(context,t('书目暂时无法读取。','The catalog record is temporarily unavailable.'));addSource(context,'Open Library',print.source);}}
  }
  function filmContent(print,body){
    const context=section(body,t('影片与主创','Film and creators'));
    const caligari=print.title.includes('Caligari');
    if(caligari){paragraph(context,t('罗伯特·维内执导的《卡里加里博士的小屋》以扭曲的布景和尖锐的斜线制造不安。BFI 指出，这种表现主义设计既是影片的艺术语言，也与当时的制作条件和发行考虑有关。','Directed by Robert Wiene, The Cabinet of Dr. Caligari makes unease visible in crooked streets and sharp angles. BFI places that expressionist design in both the film’s artistic aims and its production and release context.'));addSource(context,t('阅读 BFI 的影片分析','Read the BFI essay'),'https://www.bfi.org.uk/features/100-years-cabinet-dr-caligari/');}
    else paragraph(context,t('海报或剧照的来源在下方；主创与拍摄资料可由原始影片资料继续查找。','The original poster or frame source is below. Follow the film record for verified credits and production context.'));
    addSource(context,t('查看原图来源','Original image source'),print.source);
    const images=section(body,t('画面与拍摄资料','Frames and production'));
    const gallery=make('div','editorial-extra-images');addImage(gallery,print.src,print.title);
    if(caligari){for(const n of ['02','03']){const filename='CABINETOFDRCALIGARI-'+n+'.jpg';const a=link(t('影片截图','Film still')+' ↗','https://commons.wikimedia.org/wiki/File:'+filename,'editorial-film-image');addImage(a,'https://commons.wikimedia.org/wiki/Special:FilePath/'+filename+'?width=800',t('影片截图','Film still'));gallery.append(a);}}
    images.append(gallery);
    if(caligari){const more=make('details','editorial-more-images');more.append(make('summary','',t('展开更多画面','Show more images')));const expanded=make('div','editorial-extra-images');for(const n of ['04','05','06']){const filename='CABINETOFDRCALIGARI-'+n+'.jpg';const a=link(t('影片截图','Film still')+' ↗','https://commons.wikimedia.org/wiki/File:'+filename,'editorial-film-image');addImage(a,'https://commons.wikimedia.org/wiki/Special:FilePath/'+filename+'?width=800',t('影片截图','Film still'));expanded.append(a);}more.append(expanded);images.append(more);}
    else paragraph(images,t('目前只核对到这张图片。','This is the only image currently checked against a source.'));
    addSource(images,t('查找更多剧照','Find more film stills'),search(titleOnly(print)+' film stills'));addSource(images,t('查找幕后照片','Find production photos'),search(titleOnly(print)+' behind the scenes'));
  }
  async function memberDiscussion(root,print,room,id){
    const key=room+'|'+(room==='film'?titleOnly(print):print.source);
    const wrap=make('div','editorial-community');root.append(wrap);
    const members=make('div','editorial-member-comments'),reading=make('aside','editorial-criticism');wrap.append(members,reading);
    members.append(make('h4','',t('读者讨论','Member discussion')));
    const heart=make('button','editorial-heart',t('♡ 喜欢','♡ Like'));heart.type='button';members.append(heart);
    const list=make('div','editorial-comments-list');members.append(list);
    const form=make('form','editorial-comment-form');const input=make('textarea');input.name='body';input.maxLength=1000;input.required=true;input.rows=3;input.placeholder=t('写下你的想法…','What stayed with you?');const send=make('button','',t('发布评论','Post comment'));send.type='submit';form.append(input,send);members.append(form);
    reading.append(make('h4','',t('站外观点','Published perspectives')));
    if(room==='music'&&print.source.includes('/1558162066')){paragraph(reading,t('Nick Sylvester 特别欣赏 DOOM 的妙语和制作，同时认为唱片中段连续的拼贴短曲打断了整张播放的节奏。','Nick Sylvester praises DOOM’s one-liners and production, but argues that the run of sound-collage skits interrupts the album’s flow.'));addSource(reading,'Pitchfork · Nick Sylvester','https://pitchfork.com/reviews/albums/5255-mmfood/');}
    if(room==='film'&&print.title.includes('Caligari')){paragraph(reading,t('Alex Barrett 认为倾斜的布景、演员动作与充满歧义的结尾，共同构成这部电影持续影响恐怖电影的原因。','Alex Barrett connects the slanted sets and actors’ movements with an ambiguous ending that keeps the film influential.'));addSource(reading,'BFI · Alex Barrett','https://www.bfi.org.uk/features/100-years-cabinet-dr-caligari/');}
    addSource(reading,t('查找更多评论','Find more writing'),search(titleOnly(print)+' '+(print.artist||'')+' review'));
    if(!client){list.textContent=t('评论暂不可用。','Discussion is unavailable.');heart.disabled=true;form.hidden=true;return;}
    async function refresh(){const [likesResult,commentsResult]=await Promise.all([client.from('editorial_likes').select('user_id').eq('work_key',key),client.from('editorial_comments').select('id,user_id,nickname,body,created_at').eq('work_key',key).order('created_at',{ascending:false}).limit(40)]);if(id!==generation)return;
      if(likesResult.error||commentsResult.error){list.textContent=t('暂时无法读取讨论。','Discussion is temporarily unavailable.');heart.disabled=true;form.hidden=true;return;}
      const likes=likesResult.data||[],comments=commentsResult.data||[];const mine=likes.some(row=>row.user_id===user?.id);heart.textContent=(mine?'♥':'♡')+' '+t('喜欢','Like')+' · '+likes.length;heart.setAttribute('aria-pressed',String(mine));
      list.replaceChildren();if(!comments.length)paragraph(list,t('还没有评论。','No comments yet.'));for(const row of comments){const item=make('article','editorial-comment');item.append(make('strong','',row.nickname||t('读者','Member')),make('time','',new Date(row.created_at).toLocaleDateString(zh()?'zh-CN':'en-US')),make('p','',row.body));list.append(item);}
    }
    heart.addEventListener('click',async()=>{if(!user){dialog.close();document.getElementById('account-button')?.click();return;}heart.disabled=true;const mine=heart.getAttribute('aria-pressed')==='true';const result=mine?await client.from('editorial_likes').delete().eq('work_key',key).eq('user_id',user.id):await client.from('editorial_likes').insert({work_key:key,user_id:user.id});heart.disabled=false;if(result.error){list.prepend(make('p','editorial-error',t('未能保存喜欢。','Could not save your like.')));return;}await refresh();});
    form.addEventListener('submit',async event=>{event.preventDefault();if(!user){dialog.close();document.getElementById('account-button')?.click();return;}const body=input.value.trim();if(!body)return;send.disabled=true;const identity=await client.from('profiles').select('nickname').eq('user_id',user.id).maybeSingle();if(identity.error||!identity.data?.nickname){send.disabled=false;list.prepend(make('p','editorial-error',t('请先设置昵称。','Please set your nickname first.')));return;}const result=await client.from('editorial_comments').insert({work_key:key,user_id:user.id,nickname:identity.data.nickname,body});send.disabled=false;if(result.error){list.prepend(make('p','editorial-error',t('评论未能发布。','Could not post comment.')));return;}input.value='';await refresh();});
    await refresh();
  }
  function open(print,room){const id=++generation;dialog.replaceChildren();const header=make('header','editorial-detail-header');const close=make('button','editorial-close','×');close.type='button';close.setAttribute('aria-label',t('关闭','Close'));close.addEventListener('click',()=>dialog.close());header.append(make('small','',('AILLEURS / '+room).toUpperCase()),close);dialog.append(header);const hero=make('div','editorial-detail-hero');const picture=make('div','editorial-detail-cover');addImage(picture,print.src,print.title);const info=make('div','editorial-detail-intro');info.append(make('h2','',titleOnly(print)),make('p','',print.artist||sourceName(room)));const links=make('div','editorial-detail-links');links.append(link(sourceName(room)+' ↗',print.source));if(room==='music')links.append(link('YouTube ↗','https://www.youtube.com/results?search_query='+encodeURIComponent(titleOnly(print)+' '+print.artist)));info.append(links);hero.append(picture,info);dialog.append(hero);const body=make('div','editorial-detail-body');dialog.append(body);dialog.showModal();if(room==='music')void albumContent(print,body,id);else if(room==='art')void artContent(print,body,id);else if(room==='books')void bookContent(print,body,id);else filmContent(print,body);
    const discussion=section(body,t('喜欢与讨论','Likes and discussion'));void memberDiscussion(discussion,print,room,id);
  }
  dialog.addEventListener('close',()=>generation++);
  window.AilleursEditorial={open};
})();
