/* OpenCC character tables normalize search keys, never the displayed credits. */
(() => {
  let tables = {};
  const ready = fetch(new URL('han-search.json', document.baseURI)).then(r => {
    if (!r.ok) throw Error('Search dictionary unavailable');
    return r.json();
  }).then(data => { tables = data; }).catch(() => {});
  const convert = (value, name) => [...String(value || '').normalize('NFKC')].map(c => tables[name]?.[c] || c).join('');
  const normal = value => convert(value, 'TSCharacters').normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const variants = value => [...new Set([String(value || '').trim(), convert(value, 'STCharacters'), convert(value, 'TSCharacters')])].filter(Boolean);
  window.AilleursMusicSearch = { ready, normal, variants };
})();
