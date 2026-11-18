/* Optional, attributed song context. A title match alone never becomes a claim. */
(() => {
  const cache=new Map();
  const zh=()=>localStorage.getItem('daytone-language')==='zh';
  const word=(cn,en)=>zh()?cn:en;
  const normal=value=>String(value||'').normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  async function lookup(title,artist){
    const song=String(title||'').trim(),performer=String(artist||'').trim();
    if(song.length<3||performer.length<2)return null;
    const key=normal(song)+'|'+normal(performer);
    if(cache.has(key))return cache.get(key);
    const task=(async()=>{
      for(const language of (/[\p{Script=Han}]/u.test(song+performer)?['zh','en']:['en'])){
        const endpoint=new URL('https://'+language+'.wikipedia.org/w/api.php');
        endpoint.search=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrsearch:'intitle:"'+song.replaceAll('"','')+'" '+performer.replaceAll('"',''),gsrlimit:'4',prop:'extracts|info',exintro:'1',explaintext:'1',exchars:'900',inprop:'url'}).toString();
        try{
          const response=await fetch(endpoint,{mode:'cors',signal:AbortSignal.timeout(6500)});
          if(!response.ok)continue;
          const data=await response.json();
          const pages=Object.values(data.query?.pages||{}).filter(page=>page.title&&page.extract&&page.fullurl);
          const wanted=normal(song),artistName=normal(performer);
          const matches=pages.filter(page=>{
            const heading=normal(page.title),body=normal(page.extract);
            if(/^(list of|列表|消歧义)/i.test(page.title))return false;
            return (heading===wanted||heading.startsWith(wanted+' '))&&(heading.includes(artistName)||body.includes(artistName));
          }).sort((a,b)=>(normal(a.title)===wanted?0:1)-(normal(b.title)===wanted?0:1));
          if(matches.length){const page=matches[0];return {title:page.title,text:page.extract.trim(),url:page.fullurl,language};}
        }catch{ /* Background is optional; never invent it from a failed lookup. */ }
      }
      return null;
    })();
    cache.set(key,task);return task;
  }
  function panel(){const section=document.createElement('section');section.className='song-research';section.hidden=true;return section;}
  function gallery(section,song){
    const items=Array.isArray(song?.media_gallery)?song.media_gallery:[];
    if(!items.length)return;
    const block=document.createElement('section');block.className='song-related-photos';
    const title=document.createElement('h3');title.textContent=word('相关照片','Related photographs');block.append(title);
    const grid=document.createElement('div');grid.className='song-related-grid';
    for(const item of items.slice(0,6)){
      try{
        const src=new URL(item.src),page=new URL(item.pageUrl);
        if(src.protocol!=='https:'||src.hostname!=='upload.wikimedia.org'||page.protocol!=='https:'||page.hostname!=='commons.wikimedia.org')continue;
        const figure=document.createElement('figure'),img=document.createElement('img');img.src=src.href;img.alt=item.title||song.artist;img.loading='lazy';
        const caption=document.createElement('figcaption');caption.textContent=item.title||song.artist;
        const credit=document.createElement('a');credit.href=page.href;credit.target='_blank';credit.rel='noopener noreferrer';credit.textContent=(item.credit||'Wikimedia Commons')+' · '+(item.license||'source');
        img.addEventListener('error',()=>figure.remove(),{once:true});figure.append(img,caption,credit);grid.append(figure);
      }catch{/* A broken remote image should not hide the song. */}
    }
    block.append(grid);section.after(block);
  }
  function show(section,source){
    section.replaceChildren();
    if(!source){section.hidden=true;return;}
    section.hidden=false;
    const heading=document.createElement('h3');heading.textContent=source.scope==='album'?word('关于这张专辑','About the album'):word('关于这首歌','About this song');
    const lead=document.createElement('p');lead.textContent=source.text.slice(0,300)+(source.text.length>300?'…':'');
    const details=document.createElement('details');
    const summary=document.createElement('summary');summary.textContent=word('展开来源摘要','Read more from the source');details.append(summary);
    const full=document.createElement('p');full.textContent=source.text;details.append(full);
    const credit=document.createElement('small');credit.append(document.createTextNode('Wikipedia · CC BY-SA · '));
    const link=document.createElement('a');link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=word('查看原文 ↗','Read the source ↗');credit.append(link);
    section.append(heading,lead,details,credit);
  }
  async function mount(host,song){
    if(!host||!song?.title||!song?.artist)return;
    const section=panel();host.append(section);
    let source=await lookup(song.title,song.artist);
    if(!source&&song.album&&window.AilleursWorkResearch){const found=await window.AilleursWorkResearch.lookup(song.album,song.artist,'music');source=found?{...found,scope:'album'}:null;}
    if(section.isConnected){show(section,source);gallery(section,song);}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const form=document.getElementById('upload-form'),title=form?.elements.title,artist=form?.elements.artist,album=form?.elements.album,note=form?.elements.note;
    if(!title||!artist||!note)return;
    const section=panel();note.closest('label').after(section);
    let timer,sequence=0;
    const run=async()=>{
      const current=++sequence,song=title.value.trim(),performer=artist.value.trim(),record=album?.value.trim()||'';
      if(song.length<3||performer.length<2){show(section,null);return;}
      let source=await lookup(song,performer);
      if(!source&&record&&window.AilleursWorkResearch){const found=await window.AilleursWorkResearch.lookup(record,performer,'music');source=found?{...found,scope:'album'}:null;}
      if(current===sequence&&song===title.value.trim()&&performer===artist.value.trim()&&record===(album?.value.trim()||''))show(section,source);
    };
    const schedule=()=>{clearTimeout(timer);++sequence;show(section,null);timer=setTimeout(()=>void run(),1300);};
    title.addEventListener('input',schedule);artist.addEventListener('input',schedule);album?.addEventListener('input',schedule);
    form.addEventListener('daytone:catalog-found',schedule);
    form.addEventListener('daytone:recording-selected',schedule);
    form.addEventListener('reset',()=>{clearTimeout(timer);++sequence;show(section,null);});
  });
  window.DaytoneSongResearch={lookup,mount};
})();
