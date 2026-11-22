/* One video-selection flow for music shares and author edits. */
(() => {
  const pending=new Map(),cache=new Map();
  const normal=value=>window.AilleursMusicSearch?.normal(value)||String(value||'').normalize('NFKC').toLowerCase().trim();
  const messages={
    unconfigured:'Video search is temporarily unavailable. Retry or add a video link.',
    invalid_configuration:'Video search is temporarily unavailable. Retry or add a video link.',
    quota_exceeded:'Video search has reached today’s limit. You can still add a video link.',
    rate_limited:'Please wait a moment before searching again.',
    sign_in_required:'Log in again to search for video versions.',
    auth_unavailable:'Could not check your session. Please retry.',
    provider_unavailable:'YouTube did not respond. Please retry.'
  };
  async function search(title,artist,kind='song',retry=false){
    const key=[kind,normal(title),normal(artist)].join('|');
    if(retry)cache.delete(key);
    if(cache.has(key))return cache.get(key);
    if(pending.has(key))return pending.get(key);
    const task=(async()=>{
      try{
        const response=await client.functions.invoke('song-video-search',{body:{title,artist,kind}});
        const data=response.data;
        if(response.error||!data?.available){let reason=data?.reason;if(!reason&&response.error?.context){try{reason=(await response.error.context.json()).reason;}catch{}}return {available:false,reason:reason||'provider_unavailable',items:[]};}
        const items=(data.items||[]).filter(item=>/^[\w-]{11}$/.test(item.id)).slice(0,3);
        const result={available:true,items};cache.set(key,result);return result;
      }catch{return {available:false,reason:'provider_unavailable',items:[]};}
      finally{pending.delete(key);}
    })();pending.set(key,task);return task;
  }
  function mount(form,{videoField='video_url',host=form,auto=true}={}){
    if(!form||host.querySelector('.publish-video-results'))return;
    const title=form.elements.title,artist=form.elements.artist,video=form.elements[videoField];
    if(!title||!artist||!video)return;
    const section=el('section','publish-video-results');section.hidden=true;
    section.setAttribute('aria-label','Choose a video');
    const head=el('div','video-picker-head'),heading=el('h3','','Video'),retry=el('button','','Find videos');
    retry.type='button';head.append(heading,retry);
    const status=el('p','video-picker-status');status.setAttribute('role','status');
    const cards=el('div','publish-video-grid'),stage=el('div','publish-video-stage');
    const none=el('button','video-picker-none','No video');none.type='button';none.setAttribute('aria-pressed','false');
    section.append(head,status,cards,stage,none);
    section.hidden=!title.value.trim();status.textContent='Choose a video, add a link, or share without one.';
    const note=form.elements.note?.closest('label');if(note&&host===form)note.after(section);else host.append(section);
    let generation=0,timer,disposed=false,items=[];
    const identity=()=>({title:form.dataset.entryTrackTitle||title.value.trim(),artist:artist.value.trim(),kind:form.dataset.entryTrackTitle?'song':form.elements.share_type?.value||form.dataset.shareType||'song'});
    const apply=(item)=>{
      video.value=item?.url||'';video.dispatchEvent(new Event('input',{bubbles:true}));
      form.dataset.videoDecision=item?'selected':'none';
      form.dataset.videoAutoSelection=item?.url||'';
      if(form.elements.confirm_video)form.elements.confirm_video.checked=Boolean(item);
      form.querySelectorAll('.youtube-publish-preview,.publish-source-preview[data-source-field="video_url"]').forEach(e=>e.hidden=true);
      none.setAttribute('aria-pressed',String(!item));
      for(const button of cards.querySelectorAll('.video-use')){const selected=button.dataset.video===item?.url;button.textContent=selected?'Selected':'Use this video';button.setAttribute('aria-pressed',String(selected));}
      stage.replaceChildren();
      if(item){window.AilleursVideoPlayer?.mount(stage,[{...item,name:item.title}],{autoplay:false});status.textContent='Selected: '+item.title;}
      else status.textContent='This share will have no video.';
    };
    const render=rows=>{
      items=rows;cards.replaceChildren();stage.replaceChildren();
      for(const item of rows){
        const card=el('article','publish-video-card'),watch=el('button','publish-video-watch');watch.type='button';watch.setAttribute('aria-label','Preview video: '+item.title);
        const image=el('img');image.src=item.thumbnail||'https://i.ytimg.com/vi/'+item.id+'/mqdefault.jpg';image.alt='';image.loading='lazy';
        watch.append(image,el('span','','▶'));watch.addEventListener('click',()=>{stage.replaceChildren();window.AilleursVideoPlayer?.mount(stage,[{...item,name:item.title}],{autoplay:true});});
        const info=el('div'),use=el('button','video-use','Use this video');use.type='button';use.dataset.video=item.url;use.setAttribute('aria-pressed','false');use.addEventListener('click',()=>apply(item));
        info.append(el('strong','',item.title),el('small','',[item.kind,item.channel].filter(Boolean).join(' · ')),use);card.append(watch,info);cards.append(card);
      }
      const chosen=rows.find(row=>row.url===video.value.trim());if(chosen)apply(chosen);
    };
    async function run(force=false){
      clearTimeout(timer);const own=++generation,query=identity();section.hidden=!query.title;
      if(!query.title)return;
      retry.disabled=true;form.dataset.videoSearchState='loading';status.textContent='Finding video versions…';
      const known=query.kind==='song'?(window.AilleursMusicVideos?.find(query.title,query.artist)||[]):[];
      if(known.length)render(known.map(item=>({...item,title:item.title||item.name,url:item.url||'https://www.youtube.com/watch?v='+item.id})));
      const result=await search(query.title,query.artist,query.kind,force);
      if(disposed||own!==generation)return;
      retry.disabled=false;retry.textContent='Search again';
      form.dataset.videoSearchState=result.available?'ready':'unavailable';
      if(result.available&&result.items.length){render(result.items);if(!video.value)status.textContent='Choose the version you want people to see.';}
      else if(known.length){status.textContent='These identified versions are available. '+(result.available?'No additional matching videos were found.':messages[result.reason]||messages.provider_unavailable);}
      else{render([]);status.textContent=result.available?'No matching videos found. Check the title and artist, retry, or add a video link.':messages[result.reason]||messages.provider_unavailable;}
    }
    function changed(){
      ++generation;clearTimeout(timer);items=[];cards.replaceChildren();stage.replaceChildren();
      if(form.dataset.videoAutoSelection&&video.value===form.dataset.videoAutoSelection)video.value='';
      delete form.dataset.videoAutoSelection;delete form.dataset.videoDecision;delete form.dataset.videoSearchState;
      none.setAttribute('aria-pressed','false');section.hidden=!title.value.trim();retry.disabled=false;retry.textContent='Find videos';
      status.textContent='Confirm the work above to find video versions.';
      if(form.elements.confirm_video)form.elements.confirm_video.checked=false;
    }
    title.addEventListener('input',changed);artist.addEventListener('input',changed);
    form.addEventListener('daytone:recording-selected',()=>{changed();if(auto)void run();});
    form.addEventListener('daytone:entry-track-selected',()=>{changed();void run();});
    form.addEventListener('reset',()=>{changed();section.hidden=true;});
    retry.addEventListener('click',()=>void run(true));none.addEventListener('click',()=>{++generation;retry.disabled=false;apply(null);});
    video.addEventListener('input',()=>{if(video.value.trim()){form.dataset.videoDecision='manual';section.hidden=false;}});
    form.closest('dialog')?.addEventListener('close',()=>{generation++;clearTimeout(timer);retry.disabled=false;});
    return {search:run,section,destroy(){disposed=true;++generation;}};
  }
  function validate(form){
    if(form.elements.video_url?.value.trim())return '';
    if(form.dataset.videoDecision==='none')return '';
    if(!form.elements.title?.value.trim())return '';
    return form.dataset.videoSearchState==='loading'?'Video choices are loading. Wait, or choose No video.':'Choose a video above, add a video link, or choose No video.';
  }
  window.AilleursVideoSearch={search,mount,validate};
})();
