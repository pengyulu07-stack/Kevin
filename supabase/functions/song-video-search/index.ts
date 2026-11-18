// Official YouTube search for signed-in contributors. Requires a server-side
// YOUTUBE_API_KEY with YouTube Data API v3 enabled; never expose it in the site.
const headers={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Content-Type':'application/json; charset=utf-8',
};
const cache=new Map<string,{at:number,items:unknown[]}>();
Deno.serve(async(request:Request)=>{
  if(request.method==='OPTIONS')return new Response('ok',{headers});
  if(request.method!=='POST')return new Response(JSON.stringify({error:'POST required'}),{status:405,headers});
  try{
    const token=request.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1]||'';
    const payload=JSON.parse(atob((token.split('.')[1]||'').replace(/-/g,'+').replace(/_/g,'/')));
    if(payload.role!=='authenticated'||!payload.sub)throw Error('Sign in required');
  }catch{return new Response(JSON.stringify({error:'Sign in required'}),{status:401,headers});}
  let title='',artist='';
  try{
    const body=await request.json();title=String(body.title||'').trim().slice(0,100);artist=String(body.artist||'').trim().slice(0,100);
  }catch{return new Response(JSON.stringify({error:'Invalid request'}),{status:400,headers});}
  if(title.length<3)return new Response(JSON.stringify({error:'Song title required'}),{status:400,headers});
  const key=Deno.env.get('YOUTUBE_API_KEY');
  if(!key)return new Response(JSON.stringify({available:false,reason:'unconfigured',items:[]}),{headers});
  const query=[title,artist,'official music'].filter(Boolean).join(' ').toLocaleLowerCase();
  const cached=cache.get(query);
  if(cached&&Date.now()-cached.at<6*60*60*1000)return new Response(JSON.stringify({available:true,items:cached.items}),{headers});
  const url=new URL('https://www.googleapis.com/youtube/v3/search');
  url.search=new URLSearchParams({part:'snippet',q:query,type:'video',videoEmbeddable:'true',maxResults:'10',safeSearch:'moderate',key}).toString();
  try{
    const response=await fetch(url,{signal:AbortSignal.timeout(7000)});
    if(!response.ok)return new Response(JSON.stringify({available:false,reason:'provider_unavailable',items:[]}),{status:502,headers});
    const data=await response.json();
    const items=(data.items||[]).map((item:Record<string,unknown>)=>{
      const id=(item.id as Record<string,unknown>|undefined)?.videoId;
      const snippet=item.snippet as Record<string,unknown>|undefined;
      if(typeof id!=='string'||!/^[A-Za-z0-9_-]{11}$/.test(id)||!snippet)return null;
      const thumb=snippet.thumbnails as Record<string,Record<string,unknown>>|undefined;
      return {id,title:String(snippet.title||'').slice(0,180),channel:String(snippet.channelTitle||'').slice(0,100),thumbnail:String(thumb?.medium?.url||`https://i.ytimg.com/vi/${id}/mqdefault.jpg`),url:`https://www.youtube.com/watch?v=${id}`};
    }).filter(Boolean);
    cache.set(query,{at:Date.now(),items});
    return new Response(JSON.stringify({available:true,items}),{headers});
  }catch{return new Response(JSON.stringify({available:false,reason:'provider_unavailable',items:[]}),{status:502,headers});}
});
