// Read a YouTube video's public oEmbed card for a signed-in music contributor.
// The fixed endpoint and strict video ID prevent this from becoming a URL proxy.
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json; charset=utf-8',
};

function videoId(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    let id = '';
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(url.hostname)) {
      if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
      else id = url.pathname.match(/^\/(?:shorts|live|embed)\/([A-Za-z0-9_-]{11})\/?$/)?.[1] || '';
    } else if (url.hostname === 'youtu.be' || url.hostname === 'www.youtu.be') {
      id = url.pathname.match(/^\/([A-Za-z0-9_-]{11})\/?$/)?.[1] || '';
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'POST required' }), { status: 405, headers });
  // Supabase verifies the JWT signature before this handler runs. Require a user
  // session as well, because a legacy anon key can itself be a valid JWT.
  try {
    const token = request.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1] || '';
    const payload = JSON.parse(atob((token.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.role !== 'authenticated' || !payload.sub) throw Error('Sign in required');
  } catch { return new Response(JSON.stringify({ error: 'Sign in required' }), { status: 401, headers }); }
  let id: string | null;
  try { id = videoId((await request.json()).url); }
  catch { return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers }); }
  if (!id) return new Response(JSON.stringify({ error: 'A direct YouTube video link is required' }), { status: 400, headers });
  try {
    const endpoint = new URL('https://www.youtube.com/oembed');
    endpoint.search = new URLSearchParams({ url: `https://www.youtube.com/watch?v=${id}`, format: 'json' }).toString();
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) return new Response(JSON.stringify({ error: 'Video details unavailable' }), { status: 404, headers });
    const card = await response.json();
    return new Response(JSON.stringify({
      title: String(card.title || '').slice(0, 300),
      artist: String(card.author_name || '').slice(0, 150),
      art: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      platform: 'YouTube',
    }), { headers });
  } catch {
    return new Response(JSON.stringify({ error: 'Video details unavailable' }), { status: 502, headers });
  }
});
