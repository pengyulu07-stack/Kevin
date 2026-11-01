(() => {
  const $ = id => document.getElementById(id);
  const config = window.DAYTONE_CONFIG || {};
  const client = config.supabaseUrl && config.supabaseAnonKey && window.supabase?.createClient
    ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {auth:{persistSession:true,autoRefreshToken:true}}) : null;
  const sources = {
    songs:{fields:'id,day,title,artist,nickname,note,cover_path,source_url,created_at',heading:'title',body:'note',photo:'cover_path',edit:['title','artist','note','source_url']},
    posts:{fields:'id,day,title,nickname,body,image_path,source_url,created_at',heading:'title',body:'body',photo:'image_path',edit:['title','body','source_url']},
    comments:{fields:'id,song_id,nickname,body,image_path,created_at',heading:'body',body:'body',photo:'image_path',edit:['body']},
    post_comments:{fields:'id,post_id,nickname,body,image_path,created_at',heading:'body',body:'body',photo:'image_path',edit:['body']},
    playlists:{fields:'id,group_id,title,nickname,description,cover_path,source_url,created_at',heading:'title',body:'description',photo:'cover_path',edit:['title','description','source_url']},
    feedback:{fields:'id,day,message,created_at',heading:'message',body:'message',photo:null,edit:[]}
  };
  let type='songs',rows=[],editing=null,request=0, signedInUser=null, signedInProfile=null;
  const slotKey='daytone-curator-account-ids-v1';
  function getSlots(){try{const value=JSON.parse(localStorage.getItem(slotKey)||'[]');return Array.from({length:10},(_,i)=>/^\d{6}$/.test(value?.[i])?value[i]:'');}catch{return Array(10).fill('');}}
  let slots=getSlots();
  function renderSlots(){const list=$('curator-slot'),selected=Number(list.value)||0;list.replaceChildren();slots.forEach((id,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent='Slot '+String(i+1).padStart(2,'0')+(id?' · '+id:' · empty');list.append(option);});list.value=String(selected);$('curator-slot-id').value=slots[selected]||'';}
  function currentDay(){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const get=key=>parts.find(item=>item.type===key).value;return get('year')+'-'+get('month')+'-'+get('day');}
  const text=(tag,className,value)=>{const item=document.createElement(tag);if(className)item.className=className;if(value!=null)item.textContent=String(value);return item;};
  function photoUrl(item){const key=sources[type].photo,path=key&&item[key];if(!path||type==='playlists')return null;return client.storage.from('images').getPublicUrl(path).data.publicUrl;}
  function imagePlaceholder(host){host.append(text('span','admin-art-empty','◌'));}
  function setStatus(message){$('admin-status').textContent=message;}
  async function load(){const current=++request,source=sources[type];setStatus('Loading…');$('admin-list').replaceChildren();
    let query=client.from(type).select(source.fields).order('created_at',{ascending:false}).limit(100);
    if(type==='playlists')query=query.is('group_id',null);
    const result=await query;if(current!==request)return;
    if(result.error){setStatus('Could not load: '+result.error.message);return;}
    rows=result.data||[];render();}
  function render(){const term=$('admin-search').value.trim().toLocaleLowerCase(),list=$('admin-list');list.replaceChildren();const visible=rows.filter(row=>[row.title,row.artist,row.nickname,row.note,row.body,row.description,row.message].some(value=>String(value||'').toLocaleLowerCase().includes(term)));
    setStatus(visible.length+' item'+(visible.length===1?'':'s')+' shown · latest 100');
    if(!visible.length){list.append(text('p','admin-empty','Nothing to review here.'));return;}
    for(const item of visible){const row=text('article','admin-item'),photo=photoUrl(item);if(photo){const image=text('img');image.src=photo;image.alt='Published photo';image.loading='lazy';row.append(image);}else imagePlaceholder(row);
      const content=text('div');content.append(text('strong','',item[sources[type].heading]||'(no title)'));
      content.append(text('small','',[item.nickname?'@'+item.nickname:null,item.day||new Date(item.created_at).toLocaleDateString('en-US')].filter(Boolean).join(' · ')));
      const body=item[sources[type].body];if(body&&body!==item[sources[type].heading])content.append(text('p','',body));row.append(content);
      if(type!=='feedback'){const edit=text('button','','Review ↗');edit.type='button';edit.addEventListener('click',()=>openEditor(item));row.append(edit);}
      list.append(row);
    }
  }
  function openEditor(item){editing=item;const source=sources[type],host=$('admin-fields');host.replaceChildren();$('admin-item-meta').textContent=[item.nickname?'@'+item.nickname:'',item.day||''].filter(Boolean).join(' · ');
    for(const key of source.edit){const label=text('label','',key==='source_url'?'Music / source link':key.charAt(0).toUpperCase()+key.slice(1).replace('_',' '));
      const field=key==='body'||key==='note'||key==='description'?text('textarea'):text('input');field.name=key;field.value=item[key]||'';if(field.tagName==='INPUT')field.type=key==='source_url'?'url':'text';field.maxLength=key==='source_url'?2048:key==='body'?2000:key==='note'||key==='description'?500:100;label.append(field);host.append(label);}
    $('admin-remove-photo').checked=false;$('admin-remove-photo').parentElement.hidden=!source.photo||!item[source.photo];$('admin-edit-error').textContent='';$('admin-edit').showModal();}
  async function save(event){event.preventDefault();if(!editing)return;const source=sources[type],changes={};for(const key of source.edit){const value=String($('admin-edit-form').elements[key].value||'').trim();if(key==='title'&&!value){$('admin-edit-error').textContent='A title is required.';return;}if(key==='source_url'&&value){try{if(new URL(value).protocol!=='https:')throw Error();}catch{$('admin-edit-error').textContent='Use an HTTPS link.';return;}}changes[key]=value||null;}
    if(source.photo&&$('admin-remove-photo').checked)changes[source.photo]=null;
    const button=$('admin-save');button.disabled=true;$('admin-edit-error').textContent='';
    try{const result=await client.from(type).update(changes).eq('id',editing.id).select('id').single();if(result.error)throw result.error;$('admin-edit').close();editing=null;await load();setStatus('Saved and recorded in moderation history.');}
    catch(error){$('admin-edit-error').textContent=error.message||'Could not save this item.';}
    finally{button.disabled=false;}
  }
  async function checkAccess(){if(!client){$('auth-message').textContent='The shared database is unavailable.';return;}const {data,error}=await client.auth.getUser();if(error||!data.user){signedInUser=null;signedInProfile=null;$('curator-desk').hidden=true;$('admin-desk').hidden=true;$('admin-auth').hidden=false;return;}
    signedInUser=data.user;const profile=await client.from('profiles').select('nickname').eq('user_id',data.user.id).maybeSingle();signedInProfile=profile.data||null;
    const id=String(data.user.email||'').split('@')[0];if(/^\d{6}$/.test(id)&&!slots.includes(id)){const empty=slots.indexOf('');if(empty>=0){slots[empty]=id;localStorage.setItem(slotKey,JSON.stringify(slots));}}renderSlots();
    $('admin-auth').hidden=true;$('curator-desk').hidden=false;$('curator-identity').textContent='Signed in as @'+(signedInProfile?.nickname||'unnamed')+' · ID '+id+' · '+currentDay();
    $('curator-publish').disabled=!signedInProfile;$('curator-publish-status').textContent=signedInProfile?'Published songs will show @'+signedInProfile.nickname+'.':'Set a nickname on the public site before publishing.';
    const access=await client.from('site_admins').select('user_id').eq('user_id',data.user.id).maybeSingle();
    if(access.error){$('curator-slot-status').textContent='Content review is being set up; your own song recommendations are available.';return;}
    if(!access.data){$('curator-slot-status').textContent='Your own song recommendations are available. Content review requires editor access.';return;}
    $('admin-desk').hidden=false;void load();}
  $('admin-login').addEventListener('submit',async event=>{event.preventDefault();if(!client)return;const form=event.currentTarget,id=String(form.elements.login_id.value).trim(),password=String(form.elements.password.value);$('auth-message').textContent='Signing in…';
    const result=await client.auth.signInWithPassword({email:id+'@daytone.invalid',password});form.elements.password.value='';if(result.error){$('auth-message').textContent='Could not sign in. Check the ID and password.';return;}await checkAccess();});
  $('curator-slot').addEventListener('change',()=>{$('curator-slot-id').value=slots[Number($('curator-slot').value)]||'';$('curator-slot-status').textContent='';});
  $('curator-save-slot').addEventListener('click',()=>{const id=$('curator-slot-id').value.trim();if(!/^\d{6}$/.test(id)){$('curator-slot-status').textContent='Enter a six-digit ID.';return;}const slot=Number($('curator-slot').value);slots[slot]=id;localStorage.setItem(slotKey,JSON.stringify(slots));renderSlots();$('curator-slot-status').textContent='ID saved on this device. Its password was not stored.';});
  $('curator-switch-slot').addEventListener('click',async()=>{const id=slots[Number($('curator-slot').value)];if(!id){$('curator-slot-status').textContent='Save an ID in this slot first.';return;}await client.auth.signOut();signedInUser=null;signedInProfile=null;$('curator-desk').hidden=true;$('admin-desk').hidden=true;$('admin-auth').hidden=false;$('admin-login').elements.login_id.value=id;$('admin-login').elements.password.focus();$('auth-message').textContent='Enter the password for ID '+id+'.';});
  $('curator-song-form').addEventListener('submit',async event=>{event.preventDefault();if(!signedInUser||!signedInProfile)return;const form=event.currentTarget,data=new FormData(form),title=String(data.get('title')||'').trim(),artist=String(data.get('artist')||'').trim(),note=String(data.get('note')||'').trim(),genre=String(data.get('genre')||'other'),language=String(data.get('language')||'other_language'),url=String(data.get('source_url')||'').trim(),status=$('curator-publish-status'),button=$('curator-publish');
    if(!title){status.textContent='Enter a song title.';return;}let sourceUrl=null;if(url){try{const parsed=new URL(url);if(parsed.protocol!=='https:')throw Error();sourceUrl=parsed.href;}catch{status.textContent='Use an HTTPS music link.';return;}}
    button.disabled=true;status.textContent='Publishing…';try{const day=currentDay(),used=await client.from('songs').select('daily_slot,genres,language').eq('owner_id',signedInUser.id).eq('day',day);if(used.error)throw used.error;const rows=used.data||[];if(rows.filter(row=>(row.genres||[]).includes(genre)).length>=8)throw Error('Eight songs per category per day. Choose another category or come back tomorrow.');if(rows.filter(row=>row.language===language).length>=8)throw Error('Eight songs per language chart per day.');const taken=new Set(rows.map(row=>row.daily_slot));let published=false;for(let slot=1;slot<=120;slot++){if(taken.has(slot))continue;const result=await client.from('songs').insert({id:crypto.randomUUID(),owner_id:signedInUser.id,day,daily_slot:slot,title,artist,nickname:signedInProfile.nickname,note,genre,genres:[genre],language,audio_path:null,cover_path:null,source_url:sourceUrl,file_size:null});if(!result.error){published=true;break;}if(result.error.code!=='23505')throw result.error;}if(!published)throw Error('No free song slot today.');form.reset();status.textContent='Published “'+title+'” as @'+signedInProfile.nickname+' for '+day+'.';}
    catch(error){status.textContent='Could not publish: '+(error.message||'please try again');}finally{button.disabled=false;}});
  $('admin-tabs').addEventListener('click',event=>{const button=event.target.closest('button[data-type]');if(!button)return;type=button.dataset.type;for(const tab of $('admin-tabs').querySelectorAll('button'))tab.classList.toggle('active',tab===button);$('admin-search').value='';void load();});
  $('admin-search').addEventListener('input',render);$('admin-refresh').addEventListener('click',()=>void load());async function signout(){await client.auth.signOut();signedInUser=null;signedInProfile=null;$('curator-desk').hidden=true;$('admin-desk').hidden=true;$('admin-auth').hidden=false;$('auth-message').textContent='Signed out.';}$('admin-signout').addEventListener('click',signout);$('curator-signout').addEventListener('click',signout);
  $('admin-edit-close').addEventListener('click',()=>$('admin-edit').close());$('admin-cancel').addEventListener('click',()=>$('admin-edit').close());$('admin-edit-form').addEventListener('submit',event=>void save(event));
  renderSlots();void checkAccess();
})();
