/* Editors for published music, forum posts, and replies. Database RLS checks ownership. */
(() => {
  const dialog = el('dialog', 'author-dialog'); dialog.id = 'author-dialog';
  dialog.innerHTML = `<form id="author-edit-form"><div class="dialog-head"><div><p class="kicker">YOUR SHARED WORK</p><h2 id="author-dialog-title">Edit your post</h2></div><button type="button" id="author-close" aria-label="Close">×</button></div><p class="dialog-intro">Changes appear in the same post. Its date, reactions, and replies stay with it.</p><div id="author-fields"></div><p id="author-error" class="form-error" role="alert"></p><div class="form-actions"><button type="submit" class="primary-button" id="author-save">Save changes ↗</button></div></form>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form'), fields = dialog.querySelector('#author-fields');
  let current = null;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = raw => { if (!raw.trim()) return null; const url = new URL(raw.trim()); if (url.protocol !== 'https:') throw Error('Links must start with https://.'); return url.href; };
  function open(type, item, extra = {}) {
    if (!requireAccount() || (type === 'posts' || type === 'songs' || type === 'group_songs' ? item.owner_id : item.user_id) !== user.id) return;
    current = { type, item, ...extra };
    dialog.querySelector('#author-error').textContent = '';
    dialog.querySelector('#author-dialog-title').textContent = type.includes('comment') ? 'Edit your reply' : type === 'posts' ? 'Edit your forum' : 'Edit your song';
    if (type.includes('comment')) {
      fields.innerHTML = `<label>Reply<textarea name="body" maxlength="${type === 'post_comments' ? 800 : 500}" rows="4">${esc(item.body)}</textarea></label><label>Replace photo (optional)<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label>${item.image_path ? '<label class="author-inline"><input type="checkbox" name="remove_image"> Remove current photo</label>' : ''}`;
    } else if (type === 'posts') {
      fields.innerHTML = `<label>Forum title<input name="title" required maxlength="100" value="${esc(item.title)}"></label><label>Post type<select name="post_type"><option value="question">Question</option><option value="discussion">Discussion</option><option value="debate">Debate</option></select></label><label>Creator (optional)<input name="creator" maxlength="100" value="${esc(item.creator)}"></label><label>Note<textarea name="body" maxlength="2000" rows="4">${esc(item.body)}</textarea></label><label>Related link<input name="source_url" type="url" value="${esc(item.source_url)}"></label><label>Replace photo (optional)<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label>${item.image_path ? '<label class="author-inline"><input type="checkbox" name="remove_image"> Remove current photo</label>' : ''}`;
      form.elements.post_type.value = item.post_type;
    } else {
      fields.innerHTML = `<label>Song title<input name="title" required maxlength="100" value="${esc(item.title)}"></label><label>Artist (optional)<input name="artist" maxlength="100" value="${esc(item.artist)}"></label><label>Note (optional)<textarea name="note" maxlength="500" rows="3">${esc(item.note)}</textarea></label><fieldset class="author-genres"><legend>Music categories · choose 1–3</legend><div class="genre-check-grid">${musicGenres.map(([id,label])=>`<label><input type="checkbox" name="genres" value="${esc(id)}" ${(item.genres||[item.genre]).includes(id)?'checked':''}> ${esc(label)}</label>`).join('')}</div></fieldset><label>Language chart<select name="language">${musicLanguages.map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('')}</select></label><label>Music source<select name="media_mode"><option value="keep">Keep current source</option><option value="none">Title only</option><option value="link">Use a music link</option><option value="audio">Replace audio file</option></select></label><label>Music link<input name="source_url" type="url" value="${esc(item.source_url)}" placeholder="https://…"></label><label>New audio (optional · 8 MB max)<input name="audio" type="file" accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,audio/wav,audio/webm,.mp3,.m4a,.ogg,.wav,.webm"></label><label>Replace cover (optional)<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label>${item.cover_path ? '<label class="author-inline"><input type="checkbox" name="remove_image"> Remove current cover</label>' : ''}`;
      form.elements.language.value = item.language || 'other_language';
      form.elements.source_url.addEventListener('input', () => { form.elements.media_mode.value = form.elements.source_url.value.trim() ? 'link' : 'none'; });
      form.elements.audio.addEventListener('change', () => { if (form.elements.audio.files.length) form.elements.media_mode.value = 'audio'; });
    }
    dialog.showModal();
  }
  async function upload(groupId, file, kind) {
    if (!file?.size) return null;
    const prepared = kind === 'audio' ? file : await prepareImage(file), types = kind === 'audio' ? audioTypes : imageTypes, max = kind === 'audio' ? 8*1024*1024 : 1024*1024;
    if (prepared.size > max) throw Error(kind === 'audio' ? 'Audio must be under 8 MB.' : 'Photo must be under 1 MB.');
    const ext = types[prepared.type]; if (!ext) throw Error('Unsupported file type.');
    if (!groupId) { const bucket = kind === 'audio' ? 'tracks' : 'images', path = await uploadFile(bucket, prepared, types, max); return {bucket,path}; }
    const path = groupId+'/'+user.id+'/'+crypto.randomUUID()+'.'+ext;
    const result = await client.storage.from('group-media').upload(path, prepared, {upsert:false,contentType:prepared.type});
    if (result.error) throw result.error;
    return {bucket:'group-media',path};
  }
  async function save(event) {
    event.preventDefault(); if (!current || !requireAccount()) return;
    const {type,item,groupId,refresh} = current, data = new FormData(form), error = dialog.querySelector('#author-error'), button = dialog.querySelector('#author-save');
    error.textContent = ''; button.disabled = true; button.textContent = 'Saving…';
    const uploaded = [], old = [];
    try {
      let changes;
      if (type.includes('comment')) {
        changes = {body:String(data.get('body')||'').trim()};
        const file = form.elements.image.files[0]; if (file?.size) { const up = await upload(groupId,file,'image'); uploaded.push(up); changes.image_path=up.path; if(item.image_path)old.push({bucket:groupId?'group-media':'images',path:item.image_path}); }
        else if(data.has('remove_image')) {changes.image_path=null;if(item.image_path)old.push({bucket:groupId?'group-media':'images',path:item.image_path});}
        if (!changes.body && !(changes.image_path || (!('image_path' in changes) && item.image_path))) throw Error('A reply needs text or a photo.');
      } else if (type === 'posts') {
        changes={title:String(data.get('title')||'').trim(),post_type:String(data.get('post_type')||'question'),creator:String(data.get('creator')||'').trim(),body:String(data.get('body')||'').trim(),source_url:safeUrl(String(data.get('source_url')||''))};
        const file=form.elements.image.files[0];if(file?.size){const up=await upload(null,file,'image');uploaded.push(up);changes.image_path=up.path;if(item.image_path)old.push({bucket:'images',path:item.image_path});}
        else if(data.has('remove_image')){changes.image_path=null;if(item.image_path)old.push({bucket:'images',path:item.image_path});}
      } else {
        const genres=data.getAll('genres').map(String);if(genres.length<1||genres.length>3)throw Error('Choose one to three music categories.');
        changes={title:String(data.get('title')||'').trim(),artist:String(data.get('artist')||'').trim(),note:String(data.get('note')||'').trim(),genres,language:String(data.get('language')||'other_language')};
        if(type==='songs')changes.genre=genres[0];
        const media=String(data.get('media_mode')||'keep'),audio=form.elements.audio.files[0],url=String(data.get('source_url')||'');
        if(media==='none'){changes.audio_path=null;changes.source_url=null;changes.file_size=null;}
        if(media==='link'){changes.audio_path=null;changes.file_size=null;changes.source_url=safeUrl(url);if(!changes.source_url)throw Error('Enter a music link or choose title only.');}
        if(media==='audio'){if(!audio?.size)throw Error('Choose a new audio file.');const up=await upload(groupId,audio,'audio');uploaded.push(up);changes.audio_path=up.path;changes.source_url=null;changes.file_size=audio.size;}
        if('audio_path' in changes && item.audio_path)old.push({bucket:groupId?'group-media':'tracks',path:item.audio_path});
        const cover=form.elements.image.files[0];if(cover?.size){const up=await upload(groupId,cover,'image');uploaded.push(up);changes.cover_path=up.path;if(item.cover_path)old.push({bucket:groupId?'group-media':'images',path:item.cover_path});}
        else if(data.has('remove_image')){changes.cover_path=null;if(item.cover_path)old.push({bucket:groupId?'group-media':'images',path:item.cover_path});}
      }
      if(!changes.title && !type.includes('comment'))throw Error('Enter a title.');
      const ownerColumn=type.includes('comment')?'user_id':'owner_id';
      const result=await client.from(type).update(changes).eq('id',item.id).eq(ownerColumn,user.id).select('id').single();
      if(result.error)throw result.error;
      if(old.length)await cleanUploads(old);
      dialog.close();current=null;
      if(refresh)await refresh();
      else if(type==='songs')await loadSongs();
      else if(type==='posts'||type==='post_comments')window.dispatchEvent(new Event('daytone:forum-edited'));
      else if(type==='group_songs'||type==='group_comments')window.DaytoneMusicRooms?.reloadGroupSongs();
      toast('Changes saved.');
    } catch(failed){if(uploaded.length)await cleanUploads(uploaded);error.textContent=failed.message||'Could not save changes.';}
    finally{button.disabled=false;button.textContent='Save changes ↗';}
  }
  dialog.querySelector('#author-close').addEventListener('click',()=>dialog.close());
  form.addEventListener('submit',event=>void save(event));
  window.DaytoneAuthorTools={openSong:item=>open('songs',item),openGroupSong:(item,groupId)=>open('group_songs',item,{groupId}),openPost:item=>open('posts',item),openComment:(type,item,refresh,groupId)=>open(type,item,{refresh,groupId})};
})();
