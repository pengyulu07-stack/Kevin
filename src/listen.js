/* One listening desk for current songs, older songs, and playlist tracks. */
(() => {
  const dialog = document.createElement('dialog');
  dialog.id = 'listen-dialog';
  dialog.className = 'listen-dialog';
  dialog.innerHTML = '<div class="listen-shell"><div class="listen-top"><div><small>DAYTONE / LISTENING DESK</small><h2>Listen to this song</h2></div><button type="button" aria-label="Close listening desk">×</button></div><div id="listen-body"></div></div>';
  document.body.append(dialog);
  const body = dialog.querySelector('#listen-body');
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  let request = 0;
  const node = (tag, className, value) => { const item = document.createElement(tag); item.className = className; if (value != null) item.textContent = value; return item; };
  const search = (host, term, title) => { const link = node('a', 'listen-provider', title + ' ↗'); link.href = host + encodeURIComponent(term); link.target = '_blank'; link.rel = 'noopener noreferrer'; return link; };
  const normal = value => String(value || '').normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  function officialLinks(title, artist) {
    const term = [title, artist].filter(Boolean).join(' '), links = node('div', 'listen-links');
    const providers = [
      ['https://y.qq.com/n/ryqq/search?w=', 'QQ Music'],
      ['https://music.163.com/#/search/m/?s=', 'NetEase Music'],
      ['https://open.spotify.com/search/', 'Spotify'],
      ['https://music.apple.com/us/search?term=', 'Apple Music'],
      ['https://www.youtube.com/results?search_query=', 'YouTube']
    ];
    for (const [url, label] of providers) links.append(search(url, term + (label === 'YouTube' ? ' official audio' : ''), label));
    return links;
  }
  function frame(url) {
    const embedded = typeof musicEmbed === 'function' ? musicEmbed(url) : null;
    if (embedded) { embedded.classList.add('listen-player'); return embedded; }
    return null;
  }
  function sourceSection(song) {
    if (song.audio_path) {
      const player = node('audio', 'listen-player'); player.controls = true; player.preload = 'none';
      player.src = publicFile('tracks', song.audio_path); body.append(player);
      body.append(node('p', 'listen-note', 'Audio shared by the poster. Playback depends on the file and your browser.'));
      return true;
    }
    if (!song.source_url) return false;
    const embedded = frame(song.source_url);
    if (embedded) body.append(embedded);
    const link = node('a', 'listen-original', 'Open the shared source ↗');
    link.href = song.source_url; link.target = '_blank'; link.rel = 'noopener noreferrer'; body.append(link);
    if (embedded) body.append(node('p', 'listen-note', 'The music service decides whether this plays in full, as a preview, or after sign-in.'));
    return Boolean(embedded);
  }
  async function findRecording(title, artist, current) {
    const status = node('p', 'listen-note', 'Looking for the right recording…'); body.append(status);
    try {
      const query = new URL('https://itunes.apple.com/search');
      query.search = new URLSearchParams({term: [title, artist].filter(Boolean).join(' '), media: 'music', entity: 'song', country: 'us', limit: '12'}).toString();
      const response = await fetch(query, {mode: 'cors', signal: AbortSignal.timeout(8000)});
      if (!response.ok) throw Error('Catalog unavailable');
      const data = await response.json(); if (current !== request || !dialog.open) return;
      const wanted = normal(title), by = normal(artist);
      const score = item => (normal(item.trackName) === wanted ? 8 : normal(item.trackName).includes(wanted) ? 2 : 0) + (by && normal(item.artistName) === by ? 5 : 0);
      const matches = (data.results || []).filter(item => item.kind === 'song' && item.trackName && item.trackViewUrl)
        .sort((a, b) => score(b) - score(a)).slice(0, 4);
      status.textContent = matches.length ? 'Optional Apple catalog match. Choose a recording only if you use Apple Music.' : 'No clear catalog match. Try the music services above.';
      if (!matches.length) return;
      const choices = node('div', 'listen-choices'); body.insertBefore(choices, status.nextSibling);
      for (const item of matches) {
        const button = node('button', 'listen-choice'); button.type = 'button';
        button.append(node('strong', '', item.trackName), node('span', '', [item.artistName, item.collectionName].filter(Boolean).join(' · ')));
        button.addEventListener('click', () => {
          choices.querySelectorAll('button').forEach(value => value.classList.toggle('selected', value === button));
          body.querySelector('.listen-catalog-player')?.remove();
          const player = frame(item.trackViewUrl);
          if (player) { player.classList.add('listen-catalog-player'); choices.after(player); }
        });
        choices.append(button);
      }
      if (by && score(matches[0]) >= 13) choices.firstElementChild.click();
    } catch { if (current === request && dialog.open) status.textContent = 'Catalog search is unavailable. The original service links still work.'; }
  }
  function open(song) {
    const current = ++request, title = String(song?.title || '').trim(), artist = String(song?.artist || '').trim();
    if (!title) return;
    body.replaceChildren();
    body.append(node('h3', '', title)); if (artist) body.append(node('p', 'listen-artist', artist));
    const playable = sourceSection(song);
    body.append(node('p', 'listen-source-label', 'Open in the music app you use'));
    body.append(officialLinks(title, artist));
    if (!dialog.open) dialog.showModal();
    const sharedAudio=body.querySelector('audio');
    if(sharedAudio) void sharedAudio.play().catch(()=>{});
    if (!playable) void findRecording(title, artist, current);
  }
  dialog.addEventListener('close', () => { ++request; body.querySelectorAll('audio').forEach(audio => audio.pause()); body.replaceChildren(); });
  window.DaytoneListen = {open};
})();
