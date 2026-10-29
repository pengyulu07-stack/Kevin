/* Text-only activity, filtered per account and dismissible across devices. */
(() => {
  const byId=id=>document.getElementById(id);
  const prefs={scope:'following',display:'bell'};
  let settings={...prefs},events=[],dismissed=new Set(),followed=new Set(),seenNewest=null,request=0,activeUid=null;
  const bell=byId('notification-bell'),badge=byId('notification-count');
  bell.querySelector('span').innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>';
  const panel=el('div','notification-panel');panel.id='notification-panel';panel.hidden=true;
  const rail=el('aside','notification-rail');rail.id='notification-rail';rail.hidden=true;rail.setAttribute('aria-label','Recent notifications');
  document.body.append(panel,rail);
  const settingsHost=el('section','notification-settings');
  settingsHost.innerHTML='<h3>Notifications</h3><p>Keep the right side quiet, or let the bell hold new activity.</p><label>Show<select name="notification_scope"><option value="following">Followed charts, groups & replies to my posts</option><option value="all">All public and joined-group activity</option></select></label><label>Display<select name="notification_display"><option value="bell">Bell only</option><option value="rail">Right-side text</option><option value="both">Bell and right-side text</option></select></label><small id="notification-settings-status">Changes save to your account.</small>';
  const appearanceForm=byId('appearance-form');appearanceForm.insertBefore(settingsHost,byId('appearance-preview'));
  function ownRelevant(event){return event.subject_owner_id===user?.id&&event.actor_id!==user?.id;}
  function accepted(event){if(event.kind==='top5')return event.subject_owner_id===user?.id;if(settings.scope==='all')return true;if(ownRelevant(event))return true;if(event.group_id)return true;return (event.genres||[]).some(key=>followed.has(key))||followed.has(event.language);}
  function sentence(event){const who=event.actor_nickname?'@'+event.actor_nickname:'Someone',title=event.title||'a post';switch(event.kind){case 'song':return who+' shared a song: '+title;case 'group_song':return who+' shared in your group: '+title;case 'forum':return who+' started a forum: '+title;case 'playlist':return who+' shared a playlist: '+title;case 'song_reply':case 'group_reply':case 'forum_reply':return who+' replied to '+title;case 'song_vote':case 'group_vote':return who+' voted for '+title;case 'song_reaction':case 'group_reaction':case 'forum_reaction':return who+' reacted '+(event.emoji||'')+' to '+title;case 'top5':return 'Your song entered its day’s Top 5: '+title;default:return title;}}
  function awaitLoaded(name,detailCheck=()=>true){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{window.removeEventListener(name,onLoaded);reject(Error('This item took too long to load.'));},12000);function onLoaded(event){if(!detailCheck(event.detail))return;clearTimeout(timer);window.removeEventListener(name,onLoaded);resolve();}window.addEventListener(name,onLoaded);});}
  function focusReply(dialogId){requestAnimationFrame(()=>{const dialog=byId(dialogId),box=dialog?.querySelector('.comment-form textarea');if(dialog?.open&&box){box.scrollIntoView({block:'center',behavior:'smooth'});box.focus({preventScroll:true});}});}
  async function openEvent(event,reply=false){const app=window.DaytoneCommunity;if(!app||!client)return;const kind=event.kind;
    try{
      if(kind==='playlist'){
        await window.DaytonePlaylists?.openItem(event.subject_id,event.group_id);return;
      }
      const forum=kind.startsWith('forum');const group=kind.startsWith('group_');const table=forum?'posts':group?'group_songs':'songs';
      const result=await client.from(table).select('id,day').eq('id',event.subject_id).maybeSingle();
      if(result.error)throw result.error;if(!result.data){toast('This shared item is no longer available.');return;}
      const day=result.data.day;
      if(forum){const loaded=awaitLoaded('daytone:forums-loaded');app.setDay(day);app.show('forum-all');await loaded;app.openForumDiscussion(event.subject_id);if(reply)focusReply('generic-discussion-dialog');}
      else if(group){const loaded=awaitLoaded('daytone:group-songs-loaded',detail=>detail?.groupId===event.group_id&&detail?.day===day);app.setDay(day);app.openGroup(event.group_id);await loaded;window.DaytoneMusicRooms?.openGroupDiscussion(event.subject_id);if(reply)focusReply('group-discussion-dialog');}
      else {const loaded=awaitLoaded('daytone:songs-loaded');app.setDay(day);app.show('music-all');await loaded;app.openMusicDiscussion(event.subject_id);if(reply)focusReply('music-discussion-dialog');}
      panel.hidden=true;
    }catch(error){toast(error.message||'Could not open this notification.');}
  }
  async function dismiss(id){if(!user)return;const result=await client.from('notification_dismissals').upsert({user_id:user.id,event_id:id},{onConflict:'user_id,event_id'});if(result.error){toast('Could not dismiss this notice.');return;}dismissed.add(id);draw();}
  function makeItem(event){const row=el('div','notification-item');const text=el('div');text.append(el('p','',sentence(event)),el('time','',new Date(event.created_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})));const actions=el('div','notification-actions'),open=el('button','notification-open','View ↗');open.type='button';open.addEventListener('click',()=>void openEvent(event));actions.append(open);if(['song_reply','group_reply','forum_reply'].includes(event.kind)){const reply=el('button','notification-reply','Reply');reply.type='button';reply.addEventListener('click',()=>void openEvent(event,true));actions.append(reply);}text.append(actions);const close=el('button','notification-dismiss','×');close.type='button';close.setAttribute('aria-label','Dismiss notification');close.addEventListener('click',()=>void dismiss(event.id));row.append(text,close);return row;}
  function fill(host,visible,heading){host.replaceChildren();const top=el('div','notification-head');top.append(el('strong','',heading));if(host===panel){const close=el('button','','×');close.type='button';close.setAttribute('aria-label','Close notifications');close.addEventListener('click',()=>{panel.hidden=true;});top.append(close);}host.append(top);if(!user){host.append(el('p','notification-empty','Log in to keep your activity.'));return;}if(!visible.length){host.append(el('p','notification-empty','All caught up.'));return;}for(const event of visible.slice(0,host===rail?5:40))host.append(makeItem(event));}
  function draw(){const visible=events.filter(e=>!dismissed.has(e.id)&&accepted(e));const count=visible.length;badge.textContent=count>99?'99+':String(count);badge.hidden=!count;bell.hidden=settings.display==='rail';if(settings.display==='rail')panel.hidden=true;rail.hidden=settings.display==='bell'||!user;bell.setAttribute('aria-label',count?count+' unread notifications':'Notifications');fill(panel,visible,'Notifications');fill(rail,visible,'RECENT / '+String(count).padStart(2,'0'));}
  async function load(){const current=++request,uid=user?.id;if(!client||!uid){settings={...prefs};events=[];dismissed.clear();followed.clear();renderSettings();draw();return;}try{
      const cutoff=new Date(Date.now()-7*86400000).toISOString();const [p,f,e]=await Promise.all([
        client.from('notification_preferences').select('scope,display').eq('user_id',uid).maybeSingle(),
        client.from('user_chart_follows').select('genre').eq('user_id',uid),
        client.from('activity_events').select('id,kind,group_id,actor_id,actor_nickname,subject_owner_id,subject_id,title,emoji,genres,language,created_at').gte('created_at',cutoff).order('created_at',{ascending:false}).limit(100)
      ]);if(current!==request||user?.id!==uid)return;if(p.error||f.error||e.error)throw p.error||f.error||e.error;
      settings={...prefs,...p.data};followed=new Set((f.data||[]).map(x=>x.genre));events=e.data||[];dismissed=new Set();
      const ids=events.map(x=>x.id);for(let i=0;i<ids.length;i+=100){const d=await client.from('notification_dismissals').select('event_id').eq('user_id',uid).in('event_id',ids.slice(i,i+100));if(d.error)throw d.error;for(const row of d.data||[])dismissed.add(row.event_id);}
      if(current!==request||user?.id!==uid)return;const newest=events.find(x=>!dismissed.has(x.id)&&accepted(x))?.id||null;
      if(seenNewest&&newest&&seenNewest!==newest){bell.classList.remove('ring');void bell.offsetWidth;bell.classList.add('ring');}seenNewest=newest;renderSettings();draw();
    }catch{if(current===request){draw();toast('Notifications could not refresh right now.');}}}
  function renderSettings(){settingsHost.querySelector('[name=notification_scope]').value=settings.scope;settingsHost.querySelector('[name=notification_display]').value=settings.display;}
  async function saveSettings(){if(!requireAccount()){renderSettings();return;}const next={scope:settingsHost.querySelector('[name=notification_scope]').value,display:settingsHost.querySelector('[name=notification_display]').value};const status=byId('notification-settings-status');status.textContent='Saving…';const result=await client.from('notification_preferences').upsert({user_id:user.id,...next,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(result.error){status.textContent='Could not save. Please try again.';renderSettings();return;}settings=next;status.textContent='Saved to your account.';draw();}
  settingsHost.addEventListener('change',()=>void saveSettings());bell.addEventListener('click',()=>{panel.hidden=!panel.hidden;draw();});
  window.addEventListener('daytone:profile',()=>{const uid=user?.id||null;if(uid!==activeUid){activeUid=uid;seenNewest=null;events=[];dismissed.clear();followed.clear();}void load();});
  window.addEventListener('daytone:songs-loaded',()=>{if(user)void load();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&user)void load();});
  setInterval(()=>{if(!document.hidden&&user)void load();},60000);
  renderSettings();draw();if(user){activeUid=user.id;void load();}
})();
