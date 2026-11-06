/* Public member pages: who shared a song, their other shares, and followers. */
(() => {
  const dialog=document.createElement('dialog');dialog.className='member-dialog';dialog.setAttribute('aria-label','Member profile');
  const shell=document.createElement('div');shell.className='member-shell';dialog.append(shell);document.body.append(dialog);
  let request=0;
  const make=(tag,cls,value)=>{const node=document.createElement(tag);node.className=cls;if(value!=null)node.textContent=value;return node;};
  async function openProfile(id,knownName=''){
    if(!id||!client)return;
    const current=++request;
    shell.replaceChildren(make('p','member-status','Opening member…'));
    if(!dialog.open)dialog.showModal();
    try{
      const [songsResult,postsResult,countResult,ownResult]=await Promise.all([
        client.from('songs').select('id,day,title,artist,nickname,cover_path,audio_path,source_url,created_at').eq('owner_id',id).order('created_at',{ascending:false}).limit(30),
        client.from('posts').select('id,day,title,category,nickname,created_at').eq('owner_id',id).order('created_at',{ascending:false}).limit(20),
        client.from('user_follows').select('follower_id',{count:'exact',head:true}).eq('followed_id',id),
        user?client.from('user_follows').select('follower_id').eq('follower_id',user.id).eq('followed_id',id).maybeSingle():Promise.resolve({data:null,error:null})
      ]);
      for(const result of [songsResult,postsResult,countResult,ownResult])if(result.error)throw result.error;
      if(current!==request||!dialog.open)return;
      const songRows=songsResult.data||[],postRows=postsResult.data||[];
      const name=knownName||songRows[0]?.nickname||postRows[0]?.nickname||'Member';
      shell.replaceChildren();
      const top=make('div','member-top'),close=make('button','member-close','×');close.type='button';close.setAttribute('aria-label','Close profile');close.addEventListener('click',()=>dialog.close());top.append(make('small','','DAYTONE / MEMBER'),close);shell.append(top);
      shell.append(make('h2','',name));
      const stats=make('div','member-stats');stats.append(make('span','',songRows.length+' songs'),make('span','',postRows.length+' other shares'),make('span','',(countResult.count||0)+' followers'));shell.append(stats);
      if(id!==user?.id){
        const chosen=Boolean(ownResult.data),follow=make('button','member-follow'+(chosen?' chosen':''),chosen?'Following ✓':'＋ Follow');follow.type='button';
        follow.addEventListener('click',async()=>{
          if(!requireAccount())return;
          follow.disabled=true;
          try{const result=chosen?await client.from('user_follows').delete().eq('follower_id',user.id).eq('followed_id',id):await client.from('user_follows').insert({follower_id:user.id,followed_id:id});if(result.error)throw result.error;void openProfile(id,name);}catch(error){toast(error.message||'Could not update follow.');follow.disabled=false;}
        });shell.append(follow);
      }
      const section=make('section','member-shares');section.append(make('h3','','Shared songs'));
      if(!songRows.length)section.append(make('p','member-status','No public songs yet.'));
      for(const song of songRows){const row=make('div','member-song'),play=make('button','member-play','▶');play.type='button';play.setAttribute('aria-label','Play '+song.title);play.addEventListener('click',()=>window.DaytoneListen?.open(song));const detail=make('button','member-song-title');detail.type='button';detail.append(make('strong','',song.title),make('small','',[song.artist,song.day].filter(Boolean).join(' · ')));detail.addEventListener('click',()=>{location.href='?space=music&day='+encodeURIComponent(song.day)+'&view=all#song-'+encodeURIComponent(song.id);});row.append(play,detail);section.append(row);}
      shell.append(section);
      if(postRows.length){const other=make('section','member-shares');other.append(make('h3','','Other shares'));for(const post of postRows){const link=make('a','member-post',post.title+' · '+post.category);link.href='?space='+encodeURIComponent(post.category)+'&day='+encodeURIComponent(post.day)+'&view=all#post-'+encodeURIComponent(post.id);other.append(link);}shell.append(other);}
    }catch(error){if(current===request)shell.replaceChildren(make('p','member-status',error.message||'Could not open this member.'));}
  }
  window.DaytoneSocial={openProfile};
})();
