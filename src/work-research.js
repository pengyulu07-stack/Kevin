/* Show a checked, attributed encyclopedia introduction without writing it as a member's opinion. */
(() => {
  const cache = new Map();
  const zh = () => window.DaytoneLanguage?.get() === 'zh';
  const say = (cn, en) => zh() ? cn : en;
  const normal = value => String(value || '').normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const plain = value => String(value || '').split(' · ')[0].trim();
  const kinds = { film: /\b(film|movie|motion picture)\b/i, books: /\b(book|novel|poem|memoir|literary work)\b/i, art: /\b(painting|sculpture|artwork|print|photograph|work of art)\b/i, music: /\b(album|record|studio album)\b/i };

  async function lookup(title, creator, category) {
    const name = plain(title), maker = String(creator || '').trim(), room = category === 'daily' || category === 'forum' ? '' : category;
    if (!room || name.length < 3) return null;
    const key = [normal(name), normal(maker), room].join('|');
    if (cache.has(key)) return cache.get(key);
    const task = (async () => {
      const languages = /[\p{Script=Han}]/u.test(name + maker) ? ['zh', 'en'] : ['en'];
      for (const language of languages) {
        const endpoint = new URL('https://' + language + '.wikipedia.org/w/api.php');
        endpoint.search = new URLSearchParams({ action: 'query', format: 'json', origin: '*', generator: 'search', gsrsearch: 'intitle:"' + name.replaceAll('"', '') + '" ' + [maker, room === 'books' ? 'book' : room === 'music' ? 'album' : room].filter(Boolean).join(' '), gsrnamespace: '0', gsrlimit: '8', prop: 'extracts|info', exintro: '1', explaintext: '1', exchars: '1100', inprop: 'url' }).toString();
        try {
          const response = await fetch(endpoint, { mode: 'cors', signal: AbortSignal.timeout(6500) });
          if (!response.ok) continue;
          const data = await response.json();
          const candidates = Object.values(data.query?.pages || {}).filter(page => page.title && page.extract && page.fullurl && !/\bdisambiguation\b|消歧义/i.test(page.title));
          const exact = candidates.filter(page => {
            const heading = normal(page.title), wanted = normal(name), body = normal(page.extract);
            if (!(heading === wanted || heading.startsWith(wanted + ' '))) return false;
            if (maker && !(heading.includes(normal(maker)) || body.includes(normal(maker)))) return false;
            return !kinds[room] || language === 'zh' || kinds[room].test(page.extract);
          }).sort((a, b) => (normal(a.title) === normal(name) ? 0 : 1) - (normal(b.title) === normal(name) ? 0 : 1));
          if (exact.length) return { title: exact[0].title, text: exact[0].extract.trim(), url: exact[0].fullurl };
        } catch { /* No encyclopedia match is preferable to a guessed introduction. */ }
      }
      return null;
    })();
    cache.set(key, task);
    return task;
  }

  function render(host, source) {
    host.replaceChildren();
    host.hidden = !source;
    if (!source) return;
    const heading = document.createElement('h3'); heading.textContent = say('作品资料', 'About this work');
    const lead = document.createElement('p'); lead.textContent = source.text.slice(0, 360) + (source.text.length > 360 ? '…' : '');
    const more = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = say('展开资料', 'Read the full source summary');
    const full = document.createElement('p'); full.textContent = source.text; more.append(summary, full);
    const credit = document.createElement('small'); credit.textContent = 'Wikipedia · CC BY-SA · ';
    const link = document.createElement('a'); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = say('查看资料来源 ↗', 'Source ↗'); credit.append(link);
    host.append(heading, lead, more, credit);
  }
  async function mount(host, title, creator, category) {
    if (!host) return;
    const source = await lookup(title, creator, category);
    if (host.isConnected) render(host, source);
  }
  function composer() {
    const form = document.getElementById('generic-post-form');
    if (!form) return;
    const body = form.elements.body;
    const preview = document.createElement('section'); preview.className = 'work-research'; preview.hidden = true;
    body.closest('label').after(preview);
    let timer = 0, request = 0;
    const schedule = () => {
      clearTimeout(timer); const current = ++request; preview.hidden = true;
      const title = form.elements.title.value.trim(), creator = form.elements.creator.value.trim();
      const category = window.DaytoneCommunity?.getScreen?.()?.replace('-all', '') || '';
      if (!title || !['film', 'art', 'books'].includes(category)) return;
      timer = setTimeout(async () => {
        const source = await lookup(title, creator, category);
        if (current === request && form.elements.title.value.trim() === title && form.elements.creator.value.trim() === creator) render(preview, source);
      }, 850);
    };
    form.elements.title.addEventListener('input', schedule);
    form.elements.creator.addEventListener('input', schedule);
    form.addEventListener('reset', () => { clearTimeout(timer); ++request; preview.hidden = true; });
    document.getElementById('generic-post-dialog')?.addEventListener('close', () => { clearTimeout(timer); ++request; preview.hidden = true; });
  }
  document.addEventListener('DOMContentLoaded', composer);
  window.AilleursWorkResearch = { lookup, mount };
})();
