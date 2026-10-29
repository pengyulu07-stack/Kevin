/* The five rooms share one identity; music keeps its existing collection and database. */
(() => {
  const rooms = {
    music: { label: "音乐", title: "MUSIC SO GOOD, EVEN DEVIL MAY CRY", gallery: "MUSIC", number: "01", helper: "听见今天", image: null },
    daily: { label: "每日分享", title: "DAILY STORIES", gallery: "DAILY", number: "02", helper: "记下今天", image: null },
    forum: { label: "论坛", title: "OPEN QUESTIONS", gallery: "FORUM", number: "03", helper: "开始讨论", image: null },
    film: { label: "电影", title: "FILM FRAMES", gallery: "FILM", number: "04", helper: "分享电影", image: null },
    art: { label: "艺术", title: "ART WORKS", gallery: "ART", number: "05", helper: "展示作品", image: null }
  };
  const qs = new URLSearchParams(location.search);
  let space = rooms[qs.get("space")] ? qs.get("space") : (qs.has("day") || location.hash.startsWith("#song-") ? "music" : null);
  let screen = !space ? "landing" : (qs.has("view") || location.hash.startsWith("#post-") || location.hash.startsWith("#song-") ? "feed" : "cover");
  let day = validDay(qs.get("day")) ? qs.get("day") : today();
  let listMode = qs.get("view") === "all" || location.hash.startsWith("#post-") ? "all" : "top";
  let posts = [];
  let postReactions = new Map();
  let postComments = new Map();
  let selectedPostId = null;
  let selectedSongId = null;
  let postLoadId = 0;
  const musicImages = ["assets/music-1.png", "assets/music-2.png", "assets/music-3.png"];
  const make = (tag, className, content) => el(tag, className, content);
  const imageUrl = (path) => publicFile("images", path);

  function route(nextSpace, nextScreen, nextDay, nextMode, push = true) {
    const query = new URLSearchParams();
    if (nextSpace) query.set("space", nextSpace);
    if (nextDay && nextScreen === "feed") query.set("day", nextDay);
    if (nextScreen === "feed") query.set("view", nextMode || "top");
    const encoded = query.toString();
    const url = "./" + (encoded ? "?" + encoded : "");
    if (push) history.pushState(null, "", url);
    else history.replaceState(null, "", url);
  }
  function setScreen(nextScreen) {
    screen = nextScreen;
    document.body.dataset.screen = nextScreen;
    document.body.dataset.space = space || "none";
    $("space-gallery").hidden = nextScreen !== "landing";
    $("category-cover").hidden = nextScreen !== "cover";
    $("generic-feed").hidden = nextScreen !== "feed" || space === "music";
    $("current-space-label").textContent = space ? rooms[space].label : "五个分享空间";
    updateFloating();
  }
  function updateFloating() {
    $("floating-post").hidden = screen !== "feed" || (space === "music" ? viewMode !== "all" : listMode !== "all");
  }
  function addBackground(host, room) {
    if (space !== "music") {
      host.classList.add("room-color", "room-color-" + space);
      host.append(make("span", "room-watermark", room.gallery));
    } else {
      const panel = make("div", "music-panel");
      for (const src of musicImages) { const img = make("img"); img.src = src; img.alt = ""; panel.append(img); }
      host.append(panel);
    }
  }
  function renderGallery() {
    const grid = $("space-grid"); grid.replaceChildren();
    for (const [key, room] of Object.entries(rooms)) {
      const button = make("button", "space-card"); button.type = "button";
      button.setAttribute("aria-label", "进入" + room.label);
      const art = make("div", "space-card-art" + (key === "music" ? " music-art" : ""));
      if (key === "music") for (const src of musicImages) { const img = make("img"); img.src = src; img.alt = ""; art.append(img); }
      else { art.classList.add("room-color","room-color-"+key); art.append(make("span","room-watermark",room.gallery)); }
      art.append(make("span", "space-card-number", room.number + " / DAYTONE"));
      const meta = make("div", "space-card-meta");
      meta.append(make("b", "", room.label), make("small", "", room.gallery), make("i", "", "↗"));
      button.append(art, meta);
      button.addEventListener("click", () => selectSpace(key));
      grid.append(button);
    }
  }
  function selectSpace(key) {
    space = key; day = today(); listMode = "top";
    if (space === "music" && selectedDay !== day) setDay(day);
    route(space, "cover", day, listMode);
    setScreen("cover"); renderCover();
    if (space !== "music") void loadPosts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function topForCover() {
    if (space === "music") {
      const top = [...songs].sort((a,b) => supportCount(b)-supportCount(a) || b.created_at.localeCompare(a.created_at))[0];
      return top ? { title:top.title, image:top.cover_path ? imageUrl(top.cover_path) : null } : null;
    }
    const top = rankedPosts()[0];
    return top ? { title:top.title, image:top.image_path ? imageUrl(top.image_path) : null } : null;
  }
  function renderCover() {
    if (!space || screen !== "cover") return;
    const room = rooms[space], host = $("category-cover");
    host.className = "category-cover cover-" + space;
    host.replaceChildren();
    const art = make("div", "cover-image"); addBackground(art, room);
    art.append(make("span", "cover-label", "DAYTONE / " + room.number + " / " + room.label));
    art.append(make("span", "cover-side", "TODAY ON DISPLAY"));
    const winner = topForCover();
    if (winner) {
      const frame = make("div", "feature-frame");
      if (winner.image) { const img = make("img"); img.src = winner.image; img.alt = "今天最受支持的分享：" + winner.title; frame.append(img); }
      else frame.append(make("span", "frame-title", winner.title));
      frame.append(make("small", "", "TODAY'S MOST SUPPORTED"));
      art.append(frame);
    }
    const footer = make("div", "cover-footer");
    const enter = make("button", "cover-enter", room.title); enter.type = "button";
    enter.setAttribute("aria-label", "进入" + room.label + "今日 Top 分享");
    enter.addEventListener("click", () => {
      host.classList.add("is-zooming");
      const duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 480;
      setTimeout(() => { host.classList.remove("is-zooming"); openFeed(); }, duration);
    });
    footer.append(enter, make("small", "", "CLICK TO ENTER ↗"));
    const back = make("button", "cover-back", "← 返回所有方向"); back.type = "button";
    back.addEventListener("click", goLanding);
    host.append(art, footer, back);
  }
  function goLanding() {
    space = null; route(null, "landing", null, null); setScreen("landing");
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function openFeed() {
    if (!space) return;
    setScreen("feed");
    route(space, "feed", space === "music" ? selectedDay : day, space === "music" ? viewMode : listMode);
    if (space === "music") { renderSongs(); $("today").scrollIntoView({block:"start"}); }
    else { renderGeneric(); $("generic-feed").scrollIntoView({block:"start"}); }
  }
  function setGenericDay(nextDay) {
    if (!validDay(nextDay)) return;
    day = nextDay; $("generic-date").value = day; renderGenericWeek();
    route(space, "feed", day, listMode, false); void loadPosts();
  }
  function renderGenericWeek() {
    const rail = $("generic-week-rail"); rail.replaceChildren();
    for (let offset=-3; offset<=3; offset++) {
      const value=addDays(day,offset), button=make("button","day-tile"+(offset===0?" selected":""));
      button.type="button"; button.setAttribute("aria-label","查看 "+value+" 的分享");
      const weekday=new Intl.DateTimeFormat("zh-CN",{weekday:"short",timeZone:"UTC"}).format(new Date(value+"T12:00:00Z"));
      button.append(make("small","",weekday),make("strong","",value.slice(-2)));
      button.addEventListener("click",()=>setGenericDay(value)); rail.append(button);
    }
  }
  async function loadPosts() {
    if (!client || !space || space === "music") return;
    const request=++postLoadId, loadingSpace=space, loadingDay=day;
    $("generic-status").textContent="正在读取分享…";
    try {
      const next=await fetchEveryRow(()=>client.from("posts").select("id,owner_id,day,category,post_type,title,creator,body,nickname,image_path,source_url,created_at").eq("category",loadingSpace).eq("day",loadingDay).order("created_at",{ascending:false}).order("id"));
      const rMap=new Map(),cMap=new Map();
      for (let start=0;start<next.length;start+=50) {
        const ids=next.slice(start,start+50).map(x=>x.id);
        const [rr,cc]=await Promise.all([
          fetchEveryRow(()=>client.from("post_reactions").select("post_id,user_id,emoji").in("post_id",ids).order("post_id").order("user_id")),
          fetchEveryRow(()=>client.from("post_comments").select("id,post_id,user_id,nickname,body,image_path,created_at").in("post_id",ids).order("created_at").order("id"))
        ]);
        for (const row of rr) { const arr=rMap.get(row.post_id)||[];arr.push(row);rMap.set(row.post_id,arr); }
        for (const row of cc) { const arr=cMap.get(row.post_id)||[];arr.push(row);cMap.set(row.post_id,arr); }
      }
      if (request!==postLoadId || space!==loadingSpace || day!==loadingDay) return;
      posts=next;postReactions=rMap;postComments=cMap;
      $("generic-status").textContent=next.length?"已同步 "+day+" 的分享。":"这一天还没有分享。";
      if (screen==="cover") renderCover(); else renderGeneric();
      if ($( "generic-discussion-dialog").open && selectedPostId) {
        const selected=posts.find(x=>x.id===selectedPostId);
        if (selected) renderDiscussion(selected); else $("generic-discussion-dialog").close();
      }
    } catch (error) { if (request===postLoadId) $("generic-status").textContent="读取失败："+(error.message||"请稍后再试"); }
  }
  function postSupport(post) { return (postReactions.get(post.id)||[]).filter(x=>x.emoji==="👍"||x.emoji==="❤️").length; }
  function rankedPosts() { return [...posts].sort((a,b)=>postSupport(b)-postSupport(a)||b.created_at.localeCompare(a.created_at)||a.id.localeCompare(b.id)); }
  function renderGeneric() {
    if (!space || space==="music") return;
    const room=rooms[space], ranked=rankedPosts();
    $("generic-feed-title").textContent=room.label+(listMode==="all"?" · 当天全部分享":" · 今日 Top 5");
    $("generic-kicker").textContent=room.gallery+" / "+day;
    $("generic-date").value=day; renderGenericWeek();
    $("generic-sort-note").textContent=listMode==="all"?"按发布者分组，再按发布时间排列":"👍 与 ❤️ 计入支持数";
    $("generic-all").hidden=listMode==="all"; $("generic-top").hidden=listMode!=="all";
    const visible=listMode==="all"?[...posts].sort((a,b)=>a.nickname.localeCompare(b.nickname,"zh-CN")||b.created_at.localeCompare(a.created_at)||a.id.localeCompare(b.id)):ranked.slice(0,5);
    $("generic-count").textContent=visible.length+" 个分享";
    const list=$("generic-list");list.replaceChildren(); $("generic-empty").hidden=visible.length>0;
    let lastAuthor=null;
    for (const post of visible) {
      if (listMode==="all"&&post.nickname!==lastAuthor) { list.append(make("h3","publisher-heading","@"+post.nickname));lastAuthor=post.nickname; }
      list.append(renderPostCard(post,ranked.findIndex(x=>x.id===post.id)+1));
    }
    updateFloating();
    if (location.hash.startsWith("#post-")) document.getElementById(location.hash.slice(1))?.scrollIntoView({block:"center"});
  }
  function renderPostCard(post,rank) {
    const card=make("article","generic-card");card.id="post-"+post.id;
    const photo=make("button","generic-card-photo"+(post.image_path?"":" no-photo"));photo.type="button";
    photo.setAttribute("aria-label","打开 "+post.title+" 的讨论");
    if (post.image_path) { const img=make("img");img.src=imageUrl(post.image_path);img.alt=post.title+" 的照片";img.loading="lazy";photo.append(img); }
    else photo.append(make("span","",post.title.slice(0,2)));
    photo.addEventListener("click",()=>openDiscussion(post.id));card.append(photo);
    const body=make("div","generic-card-body");
    body.append(make("div","song-rank","#"+rank+" · "+postSupport(post)+" 人支持"));
    body.append(make("h3","",post.title));
    body.append(make("p","byline",(post.creator?post.creator+" · ":"")+"@"+post.nickname+(post.category==="forum"?" · "+({question:"提问",discussion:"讨论",debate:"辩论"}[post.post_type]||"分享"):"")));
    if (post.body) body.append(make("p","summary",post.body.length>180?post.body.slice(0,180)+"…":post.body));
    const actions=make("div","card-actions");
    addPostReactionButtons(actions,post);
    const copy=make("button","","复制名称");copy.type="button";copy.addEventListener("click",()=>void copyName(post.title));
    const open=make("button","discussion-open","讨论 "+(postComments.get(post.id)||[]).length+" ↗");open.type="button";open.addEventListener("click",()=>openDiscussion(post.id));
    actions.append(copy,open);body.append(actions);card.append(body);return card;
  }
  function addPostReactionButtons(host,post) {
    const rows=postReactions.get(post.id)||[];
    for (const symbol of emoji) {
      const count=rows.filter(x=>x.emoji===symbol).length;
      const chosen=rows.some(x=>x.emoji===symbol&&x.user_id===user?.id);
      const button=make("button",chosen?"chosen":"",symbol+" "+count);button.type="button";
      button.setAttribute("aria-label",symbol+" "+count+" 人回应");button.setAttribute("aria-pressed",String(chosen));
      button.addEventListener("click",()=>void reactToPost(post.id,symbol,chosen));host.append(button);
    }
  }
  async function reactToPost(id,symbol,chosen) {
    if (!requireAccount()) return;
    try {
      const table=client.from("post_reactions");
      const result=chosen?await table.delete().eq("post_id",id).eq("user_id",user.id):await table.upsert({post_id:id,user_id:user.id,emoji:symbol},{onConflict:"post_id,user_id"});
      if(result.error)throw result.error;
      await loadPosts();
    } catch(error){toast(error.message||"回应没有保存，请稍后重试。");}
  }
  async function copyName(name) {
    try{await navigator.clipboard.writeText(name);toast("名称已复制，可以到自己的 App 搜索。");}
    catch{toast("无法自动复制，请长按名称复制。");}
  }
  function openDiscussion(id) {
    const post=posts.find(x=>x.id===id);if(!post)return;
    selectedPostId=id;renderDiscussion(post);showDialog("generic-discussion-dialog");
  }
  function renderDiscussion(post) {
    const host=$("generic-discussion-body");host.replaceChildren();
    if(post.image_path){const img=make("img","discussion-photo");img.src=imageUrl(post.image_path);img.alt=post.title+" 的照片";host.append(img);}
    const heading=make("h2","",post.title);heading.id="discussion-title";host.append(heading);
    host.append(make("p","byline","@"+post.nickname+(post.creator?" · "+post.creator:"")));
    if(post.body)host.append(make("p","",post.body));
    if(post.source_url){const link=make("a","open-link","打开相关链接 ↗");link.href=post.source_url;link.target="_blank";link.rel="noopener noreferrer";host.append(link);}
    const copy=make("button","copy-name","复制名称，去其他 App 搜索");copy.type="button";copy.addEventListener("click",()=>void copyName(post.title));host.append(copy);
    const reactionsRow=make("div","card-actions");addPostReactionButtons(reactionsRow,post);host.append(reactionsRow);
    const list=make("div","comment-list");const items=postComments.get(post.id)||[];
    list.append(make("h3","publisher-heading","讨论 · "+items.length));
    for(const item of items){const line=make("div","comment");line.append(make("strong","",item.nickname),make("time","",new Date(item.created_at).toLocaleString("zh-CN",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})));if(item.body)line.append(make("p","",item.body));if(item.image_path){const img=make("img");img.src=imageUrl(item.image_path);img.alt=item.nickname+" 的照片";img.loading="lazy";line.append(img);}list.append(line);}host.append(list);
    const form=make("form","comment-form");const textarea=make("textarea");textarea.name="body";textarea.maxLength=800;textarea.rows=3;textarea.placeholder="提出问题、表达想法，或只发一张照片…";textarea.setAttribute("aria-label","讨论内容");
    const actions=make("div","comment-actions");const image=make("input");image.type="file";image.name="image";image.accept="image/jpeg,image/png,image/webp,image/gif";image.setAttribute("aria-label","评论照片或表情包");const submit=make("button","","发布讨论 ↗");submit.type="submit";actions.append(image,submit);const error=make("div","comment-error");error.setAttribute("role","alert");form.append(textarea,actions,error);form.addEventListener("submit",e=>void publishPostComment(e,post.id,error,submit));host.append(form);
  }
  async function publishPostComment(event,id,errorNode,button) {
    event.preventDefault();if(!requireAccount())return;
    const form=event.currentTarget,body=form.elements.body.value.trim(),file=form.elements.image.files[0];
    errorNode.textContent="";if(!body&&!file){errorNode.textContent="写一句话或选择一张照片。";return;}
    button.disabled=true;button.textContent="发布中…";const uploaded=[];
    try{
      const path=await uploadFile("images",await prepareImage(file),imageTypes,1024*1024);
      if(path)uploaded.push({bucket:"images",path});
      const result=await client.from("post_comments").insert({post_id:id,user_id:user.id,nickname:profile.nickname,body,image_path:path});
      if(result.error)throw result.error;await loadPosts();toast("讨论已发布。");
    }catch(error){await cleanUploads(uploaded);errorNode.textContent=error.message||"发布失败，请稍后重试。";}
    finally{button.disabled=false;button.textContent="发布讨论 ↗";}
  }
  function openPostForm() {
    if(space==="music"){openUpload();return;}
    if(!requireAccount())return;
    const room=rooms[space];$("generic-post-title").textContent="分享"+room.label;
    $("generic-type-field").classList.toggle("hidden",space!=="forum");
    $("generic-creator-label").textContent=space==="film"?"导演 / 创作者（选填）":space==="art"?"艺术家 / 创作者（选填）":"作者 / 创作者（选填）";
    $("generic-title-label").textContent=space==="film"?"电影名称":space==="art"?"作品名称":"名称 / 标题";
    $("generic-post-error").textContent="";showDialog("generic-post-dialog");
  }
  async function publishPost(event) {
    event.preventDefault();if(!requireAccount()||!space||space==="music")return;
    const form=$("generic-post-form"),data=new FormData(form),title=String(data.get("title")||"").trim(),creator=String(data.get("creator")||"").trim(),body=String(data.get("body")||"").trim(),urlText=String(data.get("source_url")||"").trim(),file=form.elements.image.files[0];
    const errorNode=$("generic-post-error");errorNode.textContent="";if(!title){errorNode.textContent="请填写名称或标题。";return;}
    let sourceUrl=null;if(urlText){try{const url=new URL(urlText);if(url.protocol!=="https:")throw Error();sourceUrl=url.href;}catch{errorNode.textContent="链接需要以 https:// 开头。";return;}}
    const button=$("generic-post-submit");button.disabled=true;button.textContent="发布中…";const uploaded=[];
    try{
      const publishDay=today();
      const usedResult=await client.from("posts").select("daily_slot").eq("owner_id",user.id).eq("day",publishDay).eq("category",space);
      if(usedResult.error)throw usedResult.error;
      const used=new Set((usedResult.data||[]).map(x=>x.daily_slot));if(used.size>=3)throw Error("今天在这个方向已经分享三条，明天再来吧。");
      const path=await uploadFile("images",await prepareImage(file),imageTypes,1024*1024);
      if(path)uploaded.push({bucket:"images",path});
      const record={id:crypto.randomUUID(),owner_id:user.id,day:publishDay,category:space,post_type:space==="forum"?String(data.get("post_type")||"question"):"share",title,creator,body,nickname:profile.nickname,image_path:path,source_url:sourceUrl};
      let saved=false;
      for(const slot of [1,2,3]){if(used.has(slot))continue;const result=await client.from("posts").insert({...record,daily_slot:slot});if(!result.error){saved=true;break;}if(result.error.code!=="23505")throw result.error;}
      if(!saved)throw Error("今天在这个方向已经分享三条，明天再来吧。");
      form.reset();$("generic-post-dialog").close();day=publishDay;listMode="top";setScreen("feed");route(space,"feed",day,listMode);await loadPosts();toast("已经分享到"+rooms[space].label+"。");
    }catch(error){await cleanUploads(uploaded);errorNode.textContent=error.message||"发布失败，请稍后重试。";}
    finally{button.disabled=false;button.textContent="发布分享 ↗";}
  }
  function openMusicDiscussion(id) {
    const song=songs.find(x=>x.id===id);if(!song)return;
    selectedSongId=id;renderMusicDiscussion(song);showDialog("music-discussion-dialog");
  }
  function renderMusicDiscussion(song) {
    const host=$("music-discussion-body");host.replaceChildren();
    const rank=[...songs].sort((a,b)=>supportCount(b)-supportCount(a)||b.created_at.localeCompare(a.created_at)).findIndex(x=>x.id===song.id)+1;
    host.append(createCard(song,rank,true));
  }
  function handleMusicLoaded() {
    if(screen==="cover"&&space==="music")renderCover();
    if(selectedSongId&&$("music-discussion-dialog").open){const song=songs.find(x=>x.id===selectedSongId);if(song)renderMusicDiscussion(song);else $("music-discussion-dialog").close();}
    updateFloating();
  }
  function syncFromUrl() {
    const query=new URLSearchParams(location.search);space=rooms[query.get("space")]?query.get("space"):(query.has("day")||location.hash.startsWith("#song-")?"music":null);
    screen=!space?"landing":(query.has("view")||location.hash.startsWith("#song-")||location.hash.startsWith("#post-")?"feed":"cover");
    day=validDay(query.get("day"))?query.get("day"):today();listMode=query.get("view")==="all"||location.hash.startsWith("#post-")?"all":"top";
    setScreen(screen);
    if(screen==="cover")renderCover();
    if(space&&space!=="music")void loadPosts();
    if(screen==="feed"&&space&&space!=="music")renderGeneric();
  }

  renderGallery();setScreen(screen);
  if(screen==="cover")renderCover();
  if(space&&space!=="music"){if(screen==="feed")renderGeneric();void loadPosts();}
  $("space-select").addEventListener("click",goLanding);
  $("generic-previous-day").addEventListener("click",()=>setGenericDay(addDays(day,-1)));
  $("generic-next-day").addEventListener("click",()=>setGenericDay(addDays(day,1)));
  $("generic-date").addEventListener("change",e=>setGenericDay(e.target.value));
  $("generic-all").addEventListener("click",()=>{listMode="all";route(space,"feed",day,listMode);renderGeneric();});
  $("generic-top").addEventListener("click",()=>{listMode="top";route(space,"feed",day,listMode);renderGeneric();});
  $("generic-post").addEventListener("click",openPostForm);
  $("floating-post").addEventListener("click",openPostForm);
  $("generic-post-close").addEventListener("click",()=>$("generic-post-dialog").close());
  $("generic-post-cancel").addEventListener("click",()=>$("generic-post-dialog").close());
  $("generic-post-form").addEventListener("submit",e=>void publishPost(e));
  $("generic-discussion-close").addEventListener("click",()=>$("generic-discussion-dialog").close());
  $("music-discussion-close").addEventListener("click",()=>$("music-discussion-dialog").close());
  $("music-post").addEventListener("click",openUpload);
  $("show-all-songs").addEventListener("click",()=>setTimeout(updateFloating,0));
  $("show-top-songs").addEventListener("click",()=>setTimeout(updateFloating,0));
  window.addEventListener("daytone:songs-loaded",handleMusicLoaded);
  window.addEventListener("daytone:open-music-discussion",e=>openMusicDiscussion(e.detail.id));
  window.addEventListener("popstate",syncFromUrl);
  if(client)client.auth.onAuthStateChange(()=>setTimeout(()=>{if(space&&space!=="music")renderGeneric();},0));
})();
