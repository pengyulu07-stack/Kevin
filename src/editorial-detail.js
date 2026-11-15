// Source-led work details. External reading is collected under More about.
(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'editorial-detail';
  dialog.setAttribute('aria-label', 'Work details');
  document.body.append(dialog);
  let generation = 0;
  let photoPreviewUrl = null;

  const zh = () => window.DaytoneLanguage?.get() === 'zh';
  const t = (cn, en) => zh() ? cn : en;
  const make = (tag, className = '', value = null) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== null) element.textContent = value;
    return element;
  };
  const external = (label, url) => {
    const a = make('a', '', label);
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  };
  const paragraph = (root, value, className = '') => {
    if (value) root.append(make('p', className, value));
  };
  const titleOnly = print => print.title.split(' · ')[0];
  const sourceQuery = (query, site = '') => 'https://www.google.com/search?q=' + encodeURIComponent((site ? 'site:' + site + ' ' : '') + query);
  const section = (root, title, id) => {
    const area = make('section', 'editorial-detail-section');
    area.id = 'editorial-' + id;
    area.append(make('h3', '', title));
    root.append(area);
    return area;
  };
  const textValue = value => typeof value === 'string' ? value : typeof value?.value === 'string' ? value.value : '';
  const cleanCatalogText = value => textValue(value).replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*([^*]+)\*/g, '$1');
  const isDoom = print => print.source.includes('/1558162066');
  const isCaligari = print => titleOnly(print).includes('Caligari');
  const doomVideos = [
    { name: 'Beef Rapp', id: 'XvKDFX00tsU' },
    { name: 'Hoe Cakes', id: 'Mv6kY_-zt-4' },
    { name: 'Rapp Snitch Knishes', id: 'dERcdvcXuE0' }
  ];

  function sourceMenu(print, room) {
    const more = make('details', 'editorial-more-about');
    more.append(make('summary', '', t('更多资料', 'More about')));
    const panel = make('div', 'editorial-more-panel');
    panel.append(make('strong', '', t('资料与原始页面', 'Sources and original pages')));
    if (room === 'music') {
      panel.append(external(t('专辑目录', 'Album catalog'), print.source));
      if (isDoom(print)) {
        panel.append(external(t('DOOM 谈专辑概念', 'DOOM on the album'), 'https://exclaim.ca/music/article/mf_doom_2004_interview_madvillainy'));
        panel.append(external(t('Jägel 谈封面创作', 'Jägel on the cover'), 'https://news.artnet.com/art-world/mf-doom-mm-food-20th-anniversary-2570659'));
        panel.append(external(t('Stones Throw 封面资料', 'Stones Throw artwork record'), 'https://www.stonesthrow.com/news/mf-doom-hoe-cakes-poster/'));
        panel.append(external(t('Pitchfork 乐评', 'Pitchfork review'), 'https://pitchfork.com/reviews/albums/5255-mmfood/'));
        panel.append(external(t('YouTube 观看这些视频', 'Watch on YouTube'), 'https://www.youtube.com/watch?v=XvKDFX00tsU'));
        panel.append(external(t('2005 年演出照片：shrtstck｜CC BY 2.0', '2005 performance photo: shrtstck | CC BY 2.0'), 'https://commons.wikimedia.org/wiki/File:MF_Doom_The_Loft_2005_DSC00808_(35953302).jpg'));
        panel.append(external(t('2011 年演出照片：possan｜CC BY 2.0', '2011 performance photo: possan | CC BY 2.0'), 'https://commons.wikimedia.org/wiki/File:MF_Doom_-_23_July_2011_01.jpg'));
      } else panel.append(external(t('查找准确视频版本', 'Find a specific video version'), 'https://www.youtube.com/results?search_query=' + encodeURIComponent(titleOnly(print) + ' ' + print.artist)));
    } else if (room === 'film') {
      panel.append(external(t('海报或截图出处', 'Poster or frame source'), print.source));
      if (isCaligari(print)) {
        panel.append(external(t('BFI 影片分析', 'BFI film essay'), 'https://www.bfi.org.uk/features/100-years-cabinet-dr-caligari/'));
        panel.append(external(t('影片截图来源', 'Film still records'), 'https://commons.wikimedia.org/wiki/Category:Das_Cabinet_des_Dr._Caligari_(film_screenshots)'));
      }
      panel.append(external(t('查找更多电影资料', 'Find more film material'), sourceQuery(titleOnly(print) + ' production film stills')));
    } else if (room === 'art') {
      panel.append(external(t('博物馆馆藏记录', 'Museum record'), print.source));
      panel.append(external(t('查找艺术家的其他作品', 'More by the artist'), sourceQuery(print.artist + ' artworks', 'clevelandart.org')));
    } else if (room === 'books') {
      panel.append(external(t('书目与可借阅版本', 'Catalog and editions'), print.source));
      if (titleOnly(print) === 'The Picture of Dorian Gray') panel.append(external(t('古腾堡计划全文', 'Full text at Project Gutenberg'), 'https://www.gutenberg.org/ebooks/174'));
      panel.append(external(t('查找作者资料', 'About the author'), sourceQuery(print.artist + ' author books', 'openlibrary.org')));
    }
    more.append(panel);
    more.addEventListener('toggle', () => { if (more.open) dialog.querySelectorAll('.editorial-more-about').forEach(other => { if (other !== more) other.open = false; }); });
    return more;
  }

  function lightbox(src, caption) {
    const veil = make('div', 'editorial-lightbox');
    const close = make('button', 'editorial-lightbox-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', t('关闭大图', 'Close image'));
    const image = make('img'); image.src = src; image.alt = caption;
    const label = make('p', '', caption);
    const dismiss = () => veil.remove();
    close.addEventListener('click', dismiss);
    veil.addEventListener('click', event => { if (event.target === veil) dismiss(); });
    veil.append(close, image, label);
    dialog.append(veil);
    close.focus();
  }
  function photo(root, src, caption, credit = '') {
    const figure = make('figure', 'editorial-photo');
    const button = make('button', 'editorial-photo-open');
    button.type = 'button';
    button.setAttribute('aria-label', t('放大图片：', 'Enlarge image: ') + caption);
    const image = make('img'); image.src = src; image.alt = caption; image.loading = 'lazy';
    image.onerror = () => figure.remove();
    button.append(image, make('span', '', '⛶'));
    button.addEventListener('click', () => lightbox(src, caption));
    figure.append(button, make('figcaption', '', caption + (credit ? ' · ' + credit : '')));
    root.append(figure);
  }
  function startVideo(video, player, heading) {
    const audio = dialog.querySelector('.editorial-audio');
    if (audio) audio.pause();
    player.replaceChildren();
    const frame = make('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/' + video.id + '?autoplay=1&rel=0';
    frame.title = 'MF DOOM — ' + video.name;
    frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.loading = 'eager';
    player.append(frame);
    heading.textContent = video.name + ' · ' + t('官方音频', 'Official audio');
    player.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  async function copySong(text, button) {
    try { await navigator.clipboard.writeText(text); button.textContent = '✓'; setTimeout(() => button.textContent = '⧉', 1600); }
    catch { button.textContent = '!'; }
  }

  async function albumContent(print, body, id) {
    const about = section(body, t('关于这张专辑', 'The record'), 'about');
    const watch = section(body, t('在这里听', 'Listen here'), 'watch');
    const tracks = section(body, t('曲目', 'Tracks'), 'tracks');
    const gallery = section(body, t('画面', 'Images'), 'images');
    const albumId = print.source.match(/\/album\/[^/]+\/(\d+)/)?.[1];
    if (isDoom(print)) {
      paragraph(about, t('2004 年接受采访时，DOOM 说 MM..FOOD 把自己的名字重新排列成标题，用食物的名字谈生活中的事。食物不是一层装饰；双关、人物与日常场景都从这个想法生长出来。', 'In a 2004 interview, DOOM said he reversed the letters of his name for MM..FOOD and used food names as analogies for life. The food theme runs through the wordplay, characters and ordinary situations, rather than merely decorating the title.'));
      paragraph(about, t('封面的绘画由 Jason Jägel 完成。Jägel 回忆，Jeff Jank 把唱片的试听 CD 交给他，他一边循环播放，一边先画一张铅笔草图，再完成画作；DOOM 和妻子 Jasmine 喜欢成品，随后请他继续画封底和《Hoe Cakes》的单曲封面。这是原版封面的创作经过；页面所列的 Deluxe Edition 是后来收录的版本。', 'Jason Jägel painted the original cover. He recalled listening repeatedly to a demo CD from Jeff Jank, making one pencil sketch, then completing the painting. After DOOM and Jasmine liked it, they asked him to make the back cover and the Hoe Cakes single art. This account concerns the original sleeve; the catalog shown here lists a later Deluxe Edition.'));
      paragraph(about, t('这张画把戴面具的人物放进热闹而略显奇异的食物场景。它与歌曲里反复出现的食物、漫画和拼贴声音相呼应；这层联系是本站对画面与唱片的解读。', 'The painting places the masked figure in a busy, slightly strange food scene. Its relation to the record’s food imagery, comic-book references and sound collages is this site’s reading of the work.'));
      const chooser = make('div', 'editorial-video-choices');
      const playing = make('p', 'editorial-playing', t('选择一个版本，在页面内播放。', 'Choose a recording to play here.'));
      const player = make('div', 'editorial-video-player');
      watch.append(chooser, playing, player);
      for (const video of doomVideos) {
        const button = make('button', 'editorial-video-choice'); button.type = 'button';
        const image = make('img'); image.src = 'https://i.ytimg.com/vi/' + video.id + '/hqdefault.jpg'; image.alt = '';
        button.append(image, make('span', '', video.name));
        button.addEventListener('click', () => startVideo(video, player, playing));
        chooser.append(button);
      }
      const images = make('div', 'editorial-photo-grid');
      photo(images, print.src, t('唱片封面', 'Album sleeve'), 'Jason Jägel / Jeff Jank');
      photo(images, 'https://commons.wikimedia.org/wiki/Special:FilePath/MF_Doom_The_Loft_2005_DSC00808_(35953302).jpg?width=900', t('2005 年亚特兰大的演出', 'Performing in Atlanta, 2005'), 'shrtstck | icnt.mx / CC BY 2.0');
      photo(images, 'https://commons.wikimedia.org/wiki/Special:FilePath/MF_Doom_-_23_July_2011_01.jpg?width=900', t('2011 年的演出', 'Performing in 2011'), 'possan / CC BY 2.0');
      gallery.append(images);
    } else {
      paragraph(about, t('下方先列出这个版本的发行资料与曲目。封面创作、录音背景和评论仍需逐项核对，暂不把目录信息写成创作故事。', 'The catalog facts and tracks for this edition appear below. Its cover, recording history and criticism still need source-by-source research.'));
      paragraph(watch, t('目录中若提供试听片段，可直接在曲目旁播放。', 'If the catalog supplies a preview, play it from the track list below.'));
      const images = make('div', 'editorial-photo-grid'); photo(images, print.src, t('唱片封面', 'Album cover')); gallery.append(images);
    }
    paragraph(tracks, t('正在读取曲目…', 'Loading tracks…'));
    if (!albumId) { tracks.replaceChildren(make('h3', '', t('曲目', 'Tracks'))); paragraph(tracks, t('这条记录没有可读取的曲目编号。', 'No track identifier is available for this edition.')); return; }
    try {
      const response = await fetch('https://itunes.apple.com/lookup?id=' + albumId + '&entity=song&limit=200&country=US');
      if (!response.ok) throw Error('catalog');
      const data = await response.json(); if (id !== generation) return;
      tracks.replaceChildren(make('h3', '', t('曲目', 'Tracks')));
      const album = data.results?.find(item => item.wrapperType === 'collection');
      if (album) paragraph(about, [album.releaseDate?.slice(0, 4), album.primaryGenreName, album.trackCount && album.trackCount + ' ' + t('首曲目', 'tracks')].filter(Boolean).join(' · '), 'editorial-meta');
      const songs = (data.results || []).filter(item => item.wrapperType === 'track' && String(item.collectionId) === albumId).sort((a, b) => (a.discNumber || 0) - (b.discNumber || 0) || (a.trackNumber || 0) - (b.trackNumber || 0));
      if (!songs.length) { paragraph(tracks, t('目录暂未返回曲目。', 'The catalog has no track listing.')); return; }
      const list = make('ol', 'editorial-track-list');
      const audio = make('audio', 'editorial-audio'); audio.controls = true; audio.hidden = true;
      const playing = make('p', 'editorial-audio-title');
      tracks.append(playing, audio, list);
      for (const song of songs) {
        const item = make('li');
        const name = make('strong', '', song.trackName); item.append(name);
        const actions = make('span', 'editorial-track-actions');
        const verified = isDoom(print) && doomVideos.find(video => song.trackName.toLowerCase().includes(video.name.toLowerCase()));
        if (verified) {
          const play = make('button', 'editorial-track-play', t('▶ 播放', '▶ Play')); play.type = 'button';
          play.addEventListener('click', () => { const player = watch.querySelector('.editorial-video-player'); const heading = watch.querySelector('.editorial-playing'); if (player && heading) startVideo(verified, player, heading); });
          actions.append(play);
        } else if (song.previewUrl) {
          const play = make('button', 'editorial-track-play', t('▶ 试听', '▶ Preview')); play.type = 'button';
          play.addEventListener('click', () => { watch.querySelectorAll('iframe').forEach(frame => frame.remove()); audio.src = song.previewUrl; audio.hidden = false; playing.textContent = song.trackName + ' · ' + t('试听片段', 'Preview clip'); audio.play().catch(() => {}); });
          actions.append(play);
        }
        const copy = make('button', 'editorial-copy-song', '⧉'); copy.type = 'button'; copy.title = t('复制歌名与歌手', 'Copy song and artist'); copy.setAttribute('aria-label', copy.title);
        copy.addEventListener('click', () => copySong(song.trackName + ' — ' + (song.artistName || print.artist), copy));
        actions.append(copy); item.append(actions); list.append(item);
      }
    } catch {
      if (id === generation) { tracks.replaceChildren(make('h3', '', t('曲目', 'Tracks'))); paragraph(tracks, t('目录暂时无法读取。', 'The track catalog is temporarily unavailable.')); }
    }
  }

  async function artContent(print, body, id) {
    const context = section(body, t('作品与创作背景', 'Work and context'), 'about');
    const images = section(body, t('作品图像', 'The image'), 'images');
    const gallery = make('div', 'editorial-photo-grid'); photo(gallery, print.src, titleOnly(print), print.artist); images.append(gallery);
    const accession = print.source.split('/art/')[1];
    const cached = window.AilleursArtNotes?.[accession];
    if (cached) {
      paragraph(context, [cached.creation_date, cached.technique, cached.culture].filter(Boolean).join(' · '), 'editorial-meta');
      paragraph(context, cached.description || t('馆藏记录未提供说明。', 'The museum record has no description.'));
      paragraph(images, t('馆藏目前只有这件作品的图像；没有核对到创作过程照片。', 'The catalog supplies this work image, but no verified process photographs.'));
      return;
    }
    paragraph(context, t('正在读取馆藏记录…', 'Loading museum record…'));
    try {
      const response = await fetch('https://openaccess-api.clevelandart.org/api/artworks/?accession_number=' + encodeURIComponent(accession));
      if (!response.ok) throw Error('museum');
      const json = await response.json(); if (id !== generation) return;
      const work = json.data?.[0];
      context.replaceChildren(make('h3', '', t('作品与创作背景', 'Work and context')));
      if (!work) throw Error('missing');
      paragraph(context, [work.creation_date, work.technique, work.culture?.[0]].filter(Boolean).join(' · '), 'editorial-meta');
      paragraph(context, cleanCatalogText(work.wall_description) || cleanCatalogText(work.artlens_description) || cleanCatalogText(work.description) || t('馆藏记录没有作品说明。', 'The museum record has no description.'));
    } catch { if (id === generation) { context.replaceChildren(make('h3', '', t('作品与创作背景', 'Work and context'))); paragraph(context, t('馆藏记录暂时无法读取。', 'The museum record is temporarily unavailable.')); } }
  }

  async function bookContent(print, body, id) {
    const context = section(body, t('这本书', 'The book'), 'about');
    const reading = section(body, t('翻开几页', 'Read a little'), 'reading');
    paragraph(context, t('正在读取书目…', 'Loading book record…'));
    paragraph(reading, print.artist + ' · ' + titleOnly(print), 'editorial-meta');
    if (titleOnly(print) === 'The Picture of Dorian Gray') {
      const excerpt = make('details', 'editorial-book-excerpt'); excerpt.append(make('summary', '', t('展开一小段原文', 'Read a short passage')));
      excerpt.append(make('blockquote', '', 'There is no such thing as a moral or an immoral book. Books are well written, or badly written.'));
      reading.append(excerpt);
    } else paragraph(reading, t('这本书尚无核对过的站内摘录。', 'No rights-checked excerpt has been added yet.'));
    try {
      const key = new URL(print.source).pathname;
      const response = await fetch('https://openlibrary.org' + key + '.json'); if (!response.ok) throw Error('book');
      const work = await response.json(); if (id !== generation) return;
      context.replaceChildren(make('h3', '', t('这本书', 'The book')));
      paragraph(context, cleanCatalogText(work.description).slice(0, 750) || t('书目尚无介绍。', 'The catalog has no description.'));
      paragraph(context, t('以上为 Open Library 书目资料；创作经过与专业评论仍需单独核对。', 'The text above comes from the Open Library record. Writing history and criticism need separate verification.'), 'editorial-source-note');
    } catch { if (id === generation) { context.replaceChildren(make('h3', '', t('这本书', 'The book'))); paragraph(context, t('书目暂时无法读取。', 'The catalog record is temporarily unavailable.')); } }
  }

  function filmContent(print, body) {
    const context = section(body, t('影片与主创', 'Film and creators'), 'about');
    const images = section(body, t('画面', 'Frames'), 'images');
    if (isCaligari(print)) {
      paragraph(context, t('罗伯特·维内执导的《卡里加里博士的小屋》于 1920 年问世。它把德国表现主义的倾斜街道、锯齿般的室内空间与演员动作连在一起，让不安直接成为可见的布景。', 'Robert Wiene’s 1920 film makes unease visible. Slanted streets, jagged interiors and the performers’ movements are joined into an expressionist world.'));
      paragraph(context, t('BFI 的 Alex Barrett 把这种风格放回战后德国的情绪、制作条件与电影发行的背景中，也指出结尾的框架故事没有把真实与幻觉彻底分开。下面的画面是影片截图，不是拍摄现场照片。', 'BFI writer Alex Barrett connects this style to postwar Germany, the film’s production and its release. He also notes that the framing story leaves reality and delusion unresolved. The images below are frames from the film, not behind-the-scenes photographs.'));
    } else paragraph(context, t('这张原海报或截图已核对出处。主创与拍摄资料仍需逐片补写。', 'The poster or frame has a checked source. Credits and production history still need film-by-film research.'));
    const gallery = make('div', 'editorial-photo-grid'); photo(gallery, print.src, titleOnly(print) + ' · ' + t('海报／截图', 'Poster or frame')); images.append(gallery);
    if (isCaligari(print)) {
      for (const n of ['02', '03']) photo(gallery, 'https://commons.wikimedia.org/wiki/Special:FilePath/CABINETOFDRCALIGARI-' + n + '.jpg?width=800', t('影片截图', 'Film frame') + ' ' + n, 'Wikimedia Commons');
      const more = make('details', 'editorial-more-images'); more.append(make('summary', '', t('展开更多画面', 'Show more frames')));
      const extra = make('div', 'editorial-photo-grid');
      for (const n of ['04', '05', '06']) photo(extra, 'https://commons.wikimedia.org/wiki/Special:FilePath/CABINETOFDRCALIGARI-' + n + '.jpg?width=800', t('影片截图', 'Film frame') + ' ' + n, 'Wikimedia Commons');
      more.append(extra); images.append(more);
    }
  }

  async function discussion(root, print, room, id) {
    const key = room + '|' + (room === 'film' ? titleOnly(print) : print.source);
    const grid = make('div', 'editorial-community'); root.append(grid);
    const members = make('div', 'editorial-member-comments');
    const reading = make('aside', 'editorial-criticism'); grid.append(members, reading);
    members.append(make('h4', '', t('读者讨论', 'Member discussion')));
    const heart = make('button', 'editorial-heart', '♡'); heart.type = 'button'; members.append(heart);
    const list = make('div', 'editorial-comments-list'); members.append(list);
    const form = make('form', 'editorial-comment-form');
    const input = make('textarea'); input.name = 'body'; input.maxLength = 1000; input.rows = 3; input.placeholder = t('写下你的想法，也可以只发照片…', 'Share a thought or a photograph…');
    const photoLabel = make('label', 'editorial-photo-input-label', t('＋ 添加照片', '＋ Add a photo'));
    const file = make('input'); file.type = 'file'; file.accept = 'image/jpeg,image/png,image/webp,image/gif'; photoLabel.append(file);
    const preview = make('div', 'editorial-comment-preview');
    const send = make('button', 'editorial-comment-send', t('发布', 'Post')); send.type = 'submit';
    form.append(input, photoLabel, preview, send); members.append(form);
    file.addEventListener('change', () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
      preview.replaceChildren(); const chosen = file.files?.[0];
      if (chosen) { photoPreviewUrl = URL.createObjectURL(chosen); const img = make('img'); img.src = photoPreviewUrl; img.alt = t('待发布照片', 'Selected photo'); preview.append(img, make('small', '', chosen.name)); }
    });
    reading.append(make('h4', '', t('别人的看法', 'Other readings')));
    if (room === 'music' && isDoom(print)) {
      paragraph(reading, t('Nick Sylvester 欣赏 DOOM 的双关和制作，却认为中段连续的声音拼贴打断了整张唱片的节奏。', 'Nick Sylvester admires DOOM’s wordplay and production, but hears the run of sound collages as a break in the album’s flow.'));
      paragraph(reading, 'Nick Sylvester · Pitchfork, 2004', 'editorial-attribution');
    } else if (room === 'film' && isCaligari(print)) {
      paragraph(reading, t('Alex Barrett 注意到扭曲的布景如何与演员身体结合，而结尾保留的疑问让它远不止是一场视觉实验。', 'Alex Barrett connects the distorted sets with the performers’ bodies and reads the unsettled ending as more than a visual trick.'));
      paragraph(reading, 'Alex Barrett · BFI, 2020', 'editorial-attribution');
    } else paragraph(reading, t('还没有核对过的站外评论。', 'No outside review has been checked for this work yet.'));
    if (!client) { list.textContent = t('讨论暂不可用。', 'Discussion is unavailable.'); heart.disabled = true; form.hidden = true; return; }
    async function refresh() {
      const [likesResult, commentsResult] = await Promise.all([
        client.from('editorial_likes').select('user_id').eq('work_key', key),
        client.from('editorial_comments').select('id,user_id,nickname,body,image_path,created_at').eq('work_key', key).order('created_at', { ascending: false }).limit(40)
      ]);
      if (id !== generation) return;
      if (likesResult.error || commentsResult.error) { list.textContent = t('暂时无法读取讨论。', 'Discussion is temporarily unavailable.'); heart.disabled = true; form.hidden = true; return; }
      const likes = likesResult.data || []; const mine = likes.some(row => row.user_id === user?.id);
      heart.textContent = (mine ? '♥' : '♡') + ' ' + t('喜欢', 'Like') + ' · ' + likes.length;
      heart.setAttribute('aria-pressed', String(mine));
      list.replaceChildren();
      if (!commentsResult.data?.length) paragraph(list, t('还没有评论。', 'No comments yet.'));
      for (const row of commentsResult.data || []) {
        const item = make('article', 'editorial-comment');
        const head = make('div', 'editorial-comment-head');
        head.append(make('strong', '', row.nickname || t('读者', 'Member')), make('time', '', new Date(row.created_at).toLocaleDateString(zh() ? 'zh-CN' : 'en-US')));
        if (row.user_id === user?.id) {
          const remove = make('button', 'editorial-comment-delete', t('删除', 'Delete')); remove.type = 'button';
          remove.addEventListener('click', async () => {
            remove.disabled = true;
            const result = await client.from('editorial_comments').delete().eq('id', row.id).eq('user_id', user.id);
            if (result.error) { remove.disabled = false; return; }
            if (row.image_path) await client.storage.from('images').remove([row.image_path]);
            await refresh();
          });
          head.append(remove);
        }
        item.append(head);
        if (row.body) paragraph(item, row.body);
        if (row.image_path) { const img = make('img', 'editorial-comment-image'); img.src = publicFile('images', row.image_path); img.alt = t('评论照片', 'Comment photograph'); img.loading = 'lazy'; item.append(img); }
        list.append(item);
      }
    }
    heart.addEventListener('click', async () => {
      if (!user) { dialog.close(); document.getElementById('account-button')?.click(); return; }
      heart.disabled = true; const mine = heart.getAttribute('aria-pressed') === 'true';
      const result = mine ? await client.from('editorial_likes').delete().eq('work_key', key).eq('user_id', user.id) : await client.from('editorial_likes').insert({ work_key: key, user_id: user.id });
      heart.disabled = false;
      if (result.error) { list.prepend(make('p', 'editorial-error', t('喜欢未能保存。', 'Could not save your like.'))); return; }
      await refresh();
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!user) { dialog.close(); document.getElementById('account-button')?.click(); return; }
      const body = input.value.trim(); const selected = file.files?.[0]; if (!body && !selected) return;
      send.disabled = true;
      const identity = await client.from('profiles').select('nickname').eq('user_id', user.id).maybeSingle();
      if (identity.error || !identity.data?.nickname) { send.disabled = false; list.prepend(make('p', 'editorial-error', t('请先设置昵称。', 'Set a nickname first.'))); return; }
      let imagePath = null;
      try {
        if (selected) imagePath = await uploadFile('images', await prepareImage(selected), imageTypes, 1024 * 1024);
        const result = await client.from('editorial_comments').insert({ work_key: key, user_id: user.id, nickname: identity.data.nickname, body: body || null, image_path: imagePath });
        if (result.error) throw result.error;
        input.value = ''; file.value = ''; preview.replaceChildren();
        if (photoPreviewUrl) { URL.revokeObjectURL(photoPreviewUrl); photoPreviewUrl = null; }
        await refresh();
      } catch (error) {
        if (imagePath) await client.storage.from('images').remove([imagePath]);
        list.prepend(make('p', 'editorial-error', error?.message || t('评论未能发布。', 'Could not post comment.')));
      } finally { send.disabled = false; }
    });
    await refresh();
  }

  function open(print, room) {
    const id = ++generation;
    if (photoPreviewUrl) { URL.revokeObjectURL(photoPreviewUrl); photoPreviewUrl = null; }
    dialog.replaceChildren();
    const header = make('header', 'editorial-detail-header');
    const close = make('button', 'editorial-close', '×'); close.type = 'button'; close.setAttribute('aria-label', t('关闭', 'Close')); close.addEventListener('click', () => dialog.close());
    header.append(make('small', '', ('AILLEURS / ' + room).toUpperCase()), sourceMenu(print, room), close);
    dialog.append(header);
    const hero = make('div', 'editorial-detail-hero');
    const cover = make('div', 'editorial-detail-cover'); const coverImage = make('img'); coverImage.src = print.src; coverImage.alt = print.title; cover.append(coverImage);
    const intro = make('div', 'editorial-detail-intro'); intro.append(make('h2', '', titleOnly(print)));
    if (print.artist) intro.append(external(print.artist + ' ↗', print.artist === 'MF DOOM' ? 'https://gasdrawls.com/' : sourceQuery(print.artist + ' artist author')));
    hero.append(cover, intro); dialog.append(hero);
    const tabs = make('nav', 'editorial-detail-tabs'); tabs.setAttribute('aria-label', t('本页内容', 'On this page'));
    const items = room === 'music' ? [['about', t('故事', 'Story')], ['watch', t('播放', 'Listen')], ['tracks', t('曲目', 'Tracks')], ['images', t('图片', 'Images')], ['discussion', t('讨论', 'Discuss')]] : room === 'books' ? [['about', t('介绍', 'About')], ['reading', t('阅读', 'Read')], ['discussion', t('讨论', 'Discuss')]] : [['about', t('介绍', 'About')], ['images', t('图片', 'Images')], ['discussion', t('讨论', 'Discuss')]];
    for (const [target, label] of items) {
      const button = make('button', '', label); button.type = 'button';
      button.addEventListener('click', () => dialog.querySelector('#editorial-' + target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      tabs.append(button);
    }
    dialog.append(tabs);
    const body = make('div', 'editorial-detail-body'); dialog.append(body);
    dialog.showModal();
    if (room === 'music') void albumContent(print, body, id);
    else if (room === 'art') void artContent(print, body, id);
    else if (room === 'books') void bookContent(print, body, id);
    else filmContent(print, body);
    const comments = section(body, t('喜欢与讨论', 'Likes and discussion'), 'discussion');
    void discussion(comments, print, room, id);
  }
  dialog.addEventListener('close', () => { generation++; if (photoPreviewUrl) { URL.revokeObjectURL(photoPreviewUrl); photoPreviewUrl = null; } dialog.querySelectorAll('iframe').forEach(frame => frame.remove()); });
  dialog.addEventListener('keydown', event => { if (event.key === 'Escape' && dialog.querySelector('.editorial-lightbox')) { event.preventDefault(); dialog.querySelector('.editorial-lightbox').remove(); } });
  window.AilleursEditorial = { open };
})();
