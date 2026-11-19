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
  const albumLeads={
    '1109714933':['2007 年，Radiohead 让听众自行决定《In Rainbows》的下载价格。撇开发行方式，这十首歌回到更直接的吉他、节奏与孤独感。','In 2007 Radiohead let listeners choose the download price of In Rainbows. Beyond that release experiment, these ten songs return to guitars, rhythms and loneliness.'],
    '1492263092':['《Blue》把失恋、爱情与家庭秘密写进十首歌。Joni Mitchell 在人生关系变化期间录下它；从《Little Green》到《River》，感情从不只有一种颜色。','Blue puts heartbreak, love and family secrecy into ten songs. Joni Mitchell recorded it amid personal change; Little Green and River show how many shades those feelings take.'],
    '1276760743':['Lauryn Hill 的唯一一张个人录音室专辑，把感情、信仰、成长与社会经验放在同一间想象中的课堂。开场点名时她缺席，真正的课程却从这里开始。','Lauryn Hill’s only solo studio album brings love, faith, growing up and social experience into one imagined classroom. She is absent at roll call; the lessons start there.'],
    '1443829916':['《Voodoo》在纽约 Electric Lady 录音室慢慢成形。D’Angelo 和 Soulquarians 把爵士、放克、灵魂乐与不急于迎合电台的节奏编织在一起。','Voodoo grew slowly at New York’s Electric Lady Studios. D’Angelo and the Soulquarians wove jazz, funk and soul into rhythms that refused to rush toward radio formulas.'],
    '20920260':['Björk 用近距离的低语、竖琴和细小的电子节拍，做出一张适合戴耳机听的唱片。《Vespertine》里的亲密感，也来自她在电影拍摄之后寻求庇护的时期。','Björk built a headphone record from close whispers, harp and tiny electronic beats. Vespertine’s intimacy also grew from a period of seeking refuge after a difficult film shoot.'],
    '1668862636':['虽然名叫“Ambient Works”，这张唱片仍能听到 Aphex Twin 的舞曲根基：节拍留在远处，合成器声在前景缓慢变形。','Despite its Ambient Works title, the album retains Aphex Twin’s dance roots: beats sit in the distance while synthesizer sounds shift in the foreground.'],
    '950764300':['离《Voodoo》十四年，D’Angelo 与 The Vanguard 带着《Black Messiah》回来。模拟录音的放克与灵魂乐，回应了他看到的抗议和社区行动。','Fourteen years after Voodoo, D’Angelo returned with The Vanguard on Black Messiah. Its analog funk and soul respond to protests and community action around him.'],
    '258198881':['Cocteau Twins 在家庭变故、乐队摩擦和唱片公司压力之间录下这张唱片。飘忽的吉他声与清晰的流行旋律同时存在。','Cocteau Twins recorded this amid family change, band friction and label pressure. Hazy guitar textures and clear pop hooks coexist throughout.'],
    '1440864756':['Chet Baker 已是小号手，1954 年却用脆弱、贴近耳边的声音唱起情歌。《My Funny Valentine》成为他此后反复演唱的曲目。','Already known as a trumpeter, Chet Baker sang these ballads in a fragile, close voice in 1954. My Funny Valentine became a song he would revisit repeatedly.'],
    '1440713018':['Coltrane 与经典四重奏在 1964 年的一天录下《A Love Supreme》。四个部分把一个简短的旋律动机发展成献给信仰与重生的作品。','Coltrane and his classic quartet recorded A Love Supreme in a single day in 1964. Four parts turn a short motif into a work of devotion and renewal.']
  };
  const storyFor = (print, room) => {
    const key = room === 'music' ? 'music:' + print.source.match(/\/album\/[^/]+\/(\d+)/)?.[1]
      : room === 'art' ? 'art:' + print.source.split('/art/')[1]
      : room === 'books' ? 'books:' + titleOnly(print)
      : 'film:' + (isCaligari(print) ? 'Caligari' : titleOnly(print));
    return window.AilleursWorkStories?.[key];
  };
  function addStory(root, story) {
    paragraph(root, t(...story.intro));
    const deep = make('details', 'editorial-deep-read');
    deep.append(make('summary', '', t('展开：创作与作品细节', 'Read more: making and context')));
    const chapters = make('div', 'editorial-deep-chapters'); deep.append(chapters);
    for (const chapter of story.chapters) {
      const part = make('section'); part.append(make('h4', '', t(...chapter.title)));
      paragraph(part, t(...chapter.body)); part.append(external(chapter.source + ' ↗', chapter.url)); chapters.append(part);
    }
    root.append(deep);
  }
  const doomVideos = [
    { name: 'Beef Rapp', id: 'XvKDFX00tsU' },
    { name: 'Hoe Cakes', id: 'Mv6kY_-zt-4' },
    { name: 'Rapp Snitch Knishes', id: 'dERcdvcXuE0' }
  ];
  const longRead = (root, title, description, url) => {
    const item = external(title, url);
    item.append(make('small', '', description));
    root.append(item);
  };

  function sourceMenu(print, room) {
    const more = make('details', 'editorial-more-about');
    more.append(make('summary', '', t('更多资料', 'More about')));
    const panel = make('div', 'editorial-more-panel');
    panel.append(make('strong', '', t('值得继续读', 'Further reading')));
    const story = storyFor(print, room);
    if (story?.readings) {
      for (const item of story.readings) longRead(panel, t(...item.title), t(...item.description), item.url);
    } else if (room === 'music') {
      if (isDoom(print)) {
        longRead(panel, t('食物、文字游戏和唱片结构', 'Food, wordplay and album structure'), t('Nick Sylvester 的 2004 年乐评；尤其留意他对中段拼贴的保留。', 'Nick Sylvester’s 2004 review, including a dissent on the middle stretch.'), 'https://pitchfork.com/reviews/albums/5255-mmfood/');
        longRead(panel, t('另一种听法：轻快的声音拼贴', 'A different hearing of the collages'), t('AllMusic 的 David Jeffries 对中段有相反评价。', 'David Jeffries at AllMusic hears the middle stretch differently.'), 'https://www.allmusic.com/album/mmfood-mw0000674548');
        longRead(panel, t('Jason Jägel 如何画出封面', 'How Jason Jägel painted the sleeve'), t('画家回忆试听、草图与 DOOM 对成品的反应。', 'The artist recalls the demo, sketch and DOOM’s response.'), 'https://news.artnet.com/art-world/mf-doom-mm-food-20th-anniversary-2570659');
        longRead(panel, t('Hoe Cakes 的单曲画作', 'The Hoe Cakes single artwork'), t('Stones Throw 展示唱片画面的延续。', 'Stones Throw documents the related single artwork.'), 'https://www.stonesthrow.com/news/mf-doom-hoe-cakes-poster/');
      } else longRead(panel, t('查看这个版本的曲目与发行资料', 'Track list and release details'), t('目录资料；创作背景仍需单独核对。', 'Catalog information; creative history still needs checking.'), print.source);
    } else if (room === 'film') {
      if (isCaligari(print)) {
        longRead(panel, t('表现主义如何进入银幕', 'How Expressionism reached the screen'), t('BFI 梳理战后背景、布景、演员动作与片尾的歧义。', 'BFI on postwar context, sets, performance and the ambiguous ending.'), 'https://www.bfi.org.uk/features/100-years-cabinet-dr-caligari/');
      } else longRead(panel, t('海报与影片资料', 'Poster and film record'), t('查看原始资料页面。', 'Open the original record.'), print.source);
    } else if (room === 'art') {
      longRead(panel, t('博物馆的作品研究', 'Museum research on the work'), t('年代、材料、馆藏记录与可用说明。', 'Date, materials, accession and the museum’s interpretation.'), print.source);
    } else if (room === 'books') {
      if (titleOnly(print) === 'The Picture of Dorian Gray') longRead(panel, t('阅读《道林·格雷的画像》全文', 'Read The Picture of Dorian Gray'), t('古腾堡计划收录的公版全文。', 'The public-domain edition at Project Gutenberg.'), 'https://www.gutenberg.org/ebooks/174');
      longRead(panel, t('书目与版本', 'Work and editions'), t('Open Library 的书目与可借阅版本。', 'Open Library’s catalog and editions.'), print.source);
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
  function photo(root, src, caption, credit = '', creditUrl = '') {
    const figure = make('figure', 'editorial-photo');
    const button = make('button', 'editorial-photo-open');
    button.type = 'button';
    button.setAttribute('aria-label', t('放大图片：', 'Enlarge image: ') + caption);
    const image = make('img'); image.src = src; image.alt = caption; image.loading = 'lazy';
    image.onerror = () => figure.remove();
    button.append(image, make('span', '', '⛶'));
    button.addEventListener('click', () => lightbox(src, caption));
    const figcaption = make('figcaption', '', caption);
    if (credit) figcaption.append(document.createTextNode(' · '), creditUrl ? external(credit, creditUrl) : make('span', '', credit));
    figure.append(button, figcaption);
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
    const addRelatedPhotos=async(images)=>{
      const found=await window.AilleursCommonsPhotos?.search(print.artist||'');
      if(id!==generation||!images.isConnected||!found?.length)return;
      const used=new Set([...images.querySelectorAll('img')].map(image=>image.src.toLowerCase())),seenPages=new Set([...images.querySelectorAll('figcaption a')].map(link=>link.href.toLowerCase())),events=new Set();
      let count=0;
      for(const item of found){
        const page=item.pageUrl.toLowerCase();
        if(used.has(item.src.toLowerCase())||seenPages.has(page)||events.has(item.eventKey)||[...used].some(src=>src.includes(page.split('/').pop()?.toLowerCase()||'\u0000')))continue;
        photo(images,item.src,item.title,item.credit+' · '+item.license,item.pageUrl);
        used.add(item.src.toLowerCase());seenPages.add(page);events.add(item.eventKey);count++;
        if(count===5)break;
      }
    };
    if (isDoom(print)) {
      paragraph(about, t('2004 年发行的《Mm..Food》把食物变成整张唱片的语言：歌名、双关和日常故事互相牵连。它的封面也不是随手配的插图；画家 Jason Jägel 听着唱片试播带完成了画作。', 'Released in 2004, Mm..Food builds an album-wide language from food: titles, double meanings and everyday stories connect. Its sleeve is equally deliberate: Jason Jägel made the painting while listening to a demo of the record.'));
      const deep = make('details', 'editorial-deep-read');
      deep.append(make('summary', '', t('展开：概念、制作、封面与版本', 'Read more: concept, production, sleeve and editions')));
      const chapters = make('div', 'editorial-deep-chapters'); deep.append(chapters);
      const chapter = (title, copy, url, source) => { const part = make('section'); part.append(make('h4', '', title)); paragraph(part, copy); part.append(external(source, url)); chapters.append(part); };
      chapter(t('食物怎么成为概念', 'Food as a concept'), t('标题重新排列了 MF DOOM 的名字。食物词汇在歌里承担多重意思：它既可以是真实的吃食，也可以指向友情、同行、名声和自嘲。Pitchfork 的首发乐评指出，专辑并没有机械地把每一句歌词都写成食物谜题，主题更像是把普通生活收拢到同一种语言里。', 'The title rearranges MF DOOM’s name. Food language carries several meanings at once: literal meals, friendships, other rappers, fame and self-mockery. Pitchfork’s contemporary review observes that the record does not force every line into a food riddle; the theme draws everyday subjects into a shared vocabulary.'), 'https://pitchfork.com/reviews/albums/5255-mmfood/', 'Pitchfork · 2004 ↗');
      chapter(t('谁制作了这些声音', 'Who made the music'), t('DOOM 制作了唱片的大部分音乐，但并非全部。《Potholderz》由 Count Bass D 制作；《One Beer》来自 Madlib，原本与《Madvillainy》的创作有关；《Kon Queso》由 PNS 制作，早先以《Yee Haw》之名出现。中间几段连续的声音拼贴，也让这张唱片听起来像在切换广播频道。', 'DOOM produced most, but not all, of the record. Count Bass D made Potholderz; Madlib’s One Beer came from the Madvillainy period; PNS produced Kon Queso, previously heard as Yee Haw. A run of sound collages in the middle makes the sequence feel like changing radio stations.'), 'https://pitchfork.com/reviews/albums/5255-mmfood/', 'Pitchfork · credits and review ↗');
      chapter(t('封面的创作经过', 'How the sleeve was made'), t('美术指导 Jeff Jank 把试播 CD 交给 Jason Jägel。画家回忆自己反复听它，先画铅笔草图，再完成绘画。DOOM 与 Jasmine 喜欢结果，因此又请他继续做封底和《Hoe Cakes》的单曲画面。这里谈的是 2004 年原版封面；页面显示的 Deluxe Edition 是后来的发行版本。', 'Art director Jeff Jank gave Jason Jägel a demo CD. Jägel recalled playing it repeatedly, drawing a pencil sketch and then making the painting. DOOM and Jasmine liked the result and asked him to work on the back sleeve and Hoe Cakes single art. This account concerns the original 2004 sleeve; the Deluxe Edition shown here is a later release.'), 'https://news.artnet.com/art-world/mf-doom-mm-food-20th-anniversary-2570659', 'Artnet · interview with Jägel ↗');
      chapter(t('后来出现了哪些版本', 'How later editions changed the record'), t('Rhymesayers 在二十周年再版中收录了《Kookies》的原始版本，并为数字版加进混音、替代编辑以及 Kevin Beacham 在 2004 年录下的 DOOM 访谈片段。不同发行版本的曲目数因此不一定相同；下方的曲目表只对应此处显示的 Deluxe Edition。', 'Rhymesayers’ twentieth-anniversary reissue brought back the original Kookies version. Its digital edition also added remixes, an alternate edit and excerpts from Kevin Beacham’s 2004 interviews with DOOM. Track counts therefore differ between releases; the list below belongs specifically to the Deluxe Edition displayed here.'), 'https://rhymesayers.com/blogs/news/celebrating-20-years-of-mf-dooms-mm-food', 'Rhymesayers · anniversary edition ↗');
      about.append(deep);
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
      photo(images, 'https://commons.wikimedia.org/wiki/Special:FilePath/MF_Doom_The_Loft_2005_DSC00808_(35953302).jpg?width=900', t('2005 年亚特兰大的演出', 'Performing in Atlanta, 2005'), 'shrtstck | CC BY 2.0', 'https://commons.wikimedia.org/wiki/File:MF_Doom_The_Loft_2005_DSC00808_(35953302).jpg');
      photo(images, 'https://commons.wikimedia.org/wiki/Special:FilePath/MF_Doom_-_23_July_2011_01.jpg?width=900', t('2011 年的演出', 'Performing in 2011'), 'possan | CC BY 2.0', 'https://commons.wikimedia.org/wiki/File:MF_Doom_-_23_July_2011_01.jpg');
      gallery.append(images);
      void addRelatedPhotos(images);
    } else {
      const story = storyFor(print, 'music');
      if (story) addStory(about, story);
      else {
        const lead=albumLeads[albumId];
        if(lead){paragraph(about,t(...lead));const source=make('p','editorial-source-note');source.append(external(t('发行与背景资料 ↗','Release and background ↗'),print.source));about.append(source);}
        const context=make('div','work-research');context.hidden=true;about.append(context);
        void window.AilleursWorkResearch?.mount(context,titleOnly(print),print.artist,'music');
      }
      paragraph(watch, t('点击下方曲目封面，可播放目录提供的 30 秒试听。', 'Choose a track cover below for an available 30-second catalog preview.'));
      const images = make('div', 'editorial-photo-grid'); gallery.append(images);
      void addRelatedPhotos(images);
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
      const audio = make('audio', 'editorial-audio'); audio.preload = 'none';
      const player = make('div', 'editorial-preview-player'); player.hidden = true;
      const toggle = make('button', 'editorial-preview-toggle', '▶'); toggle.type = 'button'; toggle.setAttribute('aria-label', t('暂停或继续试听', 'Pause or resume preview'));
      const playing = make('span', 'editorial-preview-title');
      const progress = make('input', 'editorial-preview-progress'); progress.type = 'range'; progress.min = 0; progress.max = 100; progress.value = 0; progress.setAttribute('aria-label', t('试听进度', 'Preview progress'));
      const time = make('span', 'editorial-preview-time', '0:00');
      const audioCover = make('img', 'editorial-preview-cover'); audioCover.src = print.src; audioCover.alt = '';
      player.append(audioCover, toggle, playing, progress, time);
      tracks.append(list, player, audio);
      const previewCredit = make('p', 'editorial-source-note', t('30 秒试听由 iTunes 提供。', '30-second previews provided courtesy of iTunes. '));
      previewCredit.append(external('Apple Music ↗', print.source));
      tracks.append(previewCredit);
      const stamp = seconds => { const n = Math.floor(Number.isFinite(seconds) ? seconds : 0); return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0'); };
      toggle.addEventListener('click', () => audio.paused ? audio.play().catch(() => {}) : audio.pause());
      audio.addEventListener('play', () => toggle.textContent = 'Ⅱ');
      audio.addEventListener('pause', () => toggle.textContent = '▶');
      audio.addEventListener('timeupdate', () => { progress.value = audio.duration ? String(audio.currentTime / audio.duration * 100) : '0'; time.textContent = stamp(audio.currentTime) + ' / ' + stamp(audio.duration); });
      progress.addEventListener('input', () => { if (audio.duration) audio.currentTime = Number(progress.value) / 100 * audio.duration; });
      for (const song of songs) {
        const item = make('li');
        if (song.previewUrl) {
          const cover = make('button', 'editorial-track-cover'); cover.type = 'button'; cover.setAttribute('aria-label', t('试听', 'Preview') + ' ' + song.trackName);
          const image = make('img'); image.src = song.artworkUrl100 || print.src; image.alt = '';
          cover.append(image, make('span', '', '▶'));
          cover.addEventListener('click', () => {
            watch.querySelectorAll('iframe').forEach(frame => frame.remove());
            if (audio.src !== song.previewUrl) { audio.src = song.previewUrl; audio.load(); }
            player.hidden = false; playing.textContent = song.trackName + ' · ' + t('30 秒试听', '30-second preview');
            audio.play().catch(() => {});
          });
          item.append(cover);
        } else item.append(make('span', 'editorial-track-cover-placeholder', '♪'));
        const name = make('strong', '', song.trackName); item.append(name);
        const actions = make('span', 'editorial-track-actions');
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
    const story = storyFor(print, 'art');
    if (story) addStory(context, story);
    const images = section(body, t('作品图像', 'The image'), 'images');
    const gallery = make('div', 'editorial-photo-grid'); photo(gallery, print.src, titleOnly(print), print.artist); images.append(gallery);
    const accession = print.source.split('/art/')[1];
    const cached = window.AilleursArtNotes?.[accession];
    if (cached) {
      paragraph(context, [cached.creation_date, cached.technique, cached.culture].filter(Boolean).join(' · '), 'editorial-meta');
      if (!story) paragraph(context, cached.description || t('馆藏记录未提供说明。', 'The museum record has no description.'));
      return;
    }
    if (!story) paragraph(context, t('正在读取馆藏记录…', 'Loading museum record…'));
    try {
      const response = await fetch('https://openaccess-api.clevelandart.org/api/artworks/?accession_number=' + encodeURIComponent(accession));
      if (!response.ok) throw Error('museum');
      const json = await response.json(); if (id !== generation) return;
      const work = json.data?.[0];
      if (!story) context.replaceChildren(make('h3', '', t('作品与创作背景', 'Work and context')));
      if (!work) throw Error('missing');
      paragraph(context, [work.creation_date, work.technique, work.culture?.[0]].filter(Boolean).join(' · '), 'editorial-meta');
      if (!story) paragraph(context, cleanCatalogText(work.wall_description) || cleanCatalogText(work.artlens_description) || cleanCatalogText(work.description) || t('馆藏记录没有作品说明。', 'The museum record has no description.'));
    } catch { if (id === generation && !story) { context.replaceChildren(make('h3', '', t('作品与创作背景', 'Work and context'))); paragraph(context, t('馆藏记录暂时无法读取。', 'The museum record is temporarily unavailable.')); } }
  }

  async function bookContent(print, body, id) {
    const context = section(body, t('这本书', 'The book'), 'about');
    const story = storyFor(print, 'books');
    if (story) addStory(context, story);
    const reading = titleOnly(print) === 'The Picture of Dorian Gray' ? section(body, t('翻开几页', 'Read a little'), 'reading') : null;
    if (!story) paragraph(context, t('正在读取书目…', 'Loading book record…'));
    if(reading)paragraph(reading, print.artist + ' · ' + titleOnly(print), 'editorial-meta');
    if (titleOnly(print) === 'The Picture of Dorian Gray') {
      const excerpt = make('details', 'editorial-book-excerpt'); excerpt.append(make('summary', '', t('展开一小段原文', 'Read a short passage')));
      excerpt.append(make('blockquote', '', 'There is no such thing as a moral or an immoral book. Books are well written, or badly written.'));
      reading.append(excerpt);
    }
    try {
      const key = new URL(print.source).pathname;
      const response = await fetch('https://openlibrary.org' + key + '.json'); if (!response.ok) throw Error('book');
      const work = await response.json(); if (id !== generation) return;
      if (!story) {
        context.replaceChildren(make('h3', '', t('这本书', 'The book')));
        paragraph(context, cleanCatalogText(work.description).slice(0, 750) || t('书目尚无介绍。', 'The catalog has no description.'));
        paragraph(context, t('以上为 Open Library 书目资料；创作经过与专业评论仍需单独核对。', 'The text above comes from the Open Library record. Writing history and criticism need separate verification.'), 'editorial-source-note');
      }
    } catch { if (id === generation && !story) { context.replaceChildren(make('h3', '', t('这本书', 'The book'))); paragraph(context, t('书目暂时无法读取。', 'The catalog record is temporarily unavailable.')); } }
    if(id===generation&&!story){
      const source=make('div','work-research');source.hidden=true;context.append(source);
      void window.AilleursWorkResearch?.mount(source,titleOnly(print),print.artist,'books');
    }
  }

  function filmContent(print, body) {
    const context = section(body, t('影片与主创', 'Film and creators'), 'about');
    const images = section(body, t('画面', 'Frames'), 'images');
    const story = storyFor(print, 'film');
    if (story) addStory(context, story);
    else if (isCaligari(print)) {
      paragraph(context, t('罗伯特·维内执导的《卡里加里博士的小屋》于 1920 年问世。它把德国表现主义的倾斜街道、锯齿般的室内空间与演员动作连在一起，让不安直接成为可见的布景。', 'Robert Wiene’s 1920 film makes unease visible. Slanted streets, jagged interiors and the performers’ movements are joined into an expressionist world.'));
      paragraph(context, t('BFI 的 Alex Barrett 把这种风格放回战后德国的情绪、制作条件与电影发行的背景中，也指出结尾的框架故事没有把真实与幻觉彻底分开。下面的画面是影片截图，不是拍摄现场照片。', 'BFI writer Alex Barrett connects this style to postwar Germany, the film’s production and its release. He also notes that the framing story leaves reality and delusion unresolved. The images below are frames from the film, not behind-the-scenes photographs.'));
    } else {
      const source=make('div','work-research');source.hidden=true;context.append(source);
      void window.AilleursWorkResearch?.mount(source,titleOnly(print),'','film');
    }
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
      paragraph(reading, t('同一段拼贴，听出了相反的结果。David Jeffries 认为那段近乎纯器乐的中段很有玩心，证明 DOOM 不被潮流牵着走；Nick Sylvester 则觉得四段连放打断了整张唱片的节奏。两人都重视 DOOM 的制作能力，分歧在于这些短片段是否值得占据唱片中心。', 'The same middle stretch produced opposite responses. David Jeffries hears a playful, mostly instrumental passage that shows DOOM resisting fashion. Nick Sylvester hears four collages in a row interrupting the album’s flow. Both take DOOM’s production seriously; they disagree on whether those short pieces earn their central place.'));
      const views = make('div', 'editorial-review-links');
      views.append(external('David Jeffries · AllMusic ↗', 'https://www.allmusic.com/album/mmfood-mw0000674548'), external('Nick Sylvester · Pitchfork ↗', 'https://pitchfork.com/reviews/albums/5255-mmfood/'));
      reading.append(views);
    } else if (storyFor(print, room)?.perspective) {
      const view = storyFor(print, room).perspective;
      paragraph(reading, t(...view.text));
      reading.append(external(view.by + ' ↗', view.url));
    } else if (room === 'film' && isCaligari(print)) {
      paragraph(reading, t('Alex Barrett 注意到扭曲的布景如何与演员身体结合，而结尾保留的疑问让它远不止是一场视觉实验。', 'Alex Barrett connects the distorted sets with the performers’ bodies and reads the unsettled ending as more than a visual trick.'));
      paragraph(reading, 'Alex Barrett · BFI, 2020', 'editorial-attribution');
    } else {reading.remove();grid.classList.add('without-criticism');}
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
    const albumIndex=room==='music'?(window.AilleursMusicCovers||[]).findIndex(item=>item.source===print.source):-1;
    const theme=albumIndex>=0?window.AilleursAlbumThemes?.[albumIndex]:null;
    dialog.classList.toggle('album-themed',!!theme);
    if(theme){
      dialog.style.setProperty('--record-paper',theme.paper);
      dialog.style.setProperty('--record-panel',theme.panel);
      dialog.style.setProperty('--record-accent',theme.accent);
      dialog.dataset.albumMotif=theme.motif;
    }else{
      dialog.style.removeProperty('--record-paper');dialog.style.removeProperty('--record-panel');dialog.style.removeProperty('--record-accent');delete dialog.dataset.albumMotif;
    }
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
  dialog.addEventListener('close', () => { generation++; if (photoPreviewUrl) { URL.revokeObjectURL(photoPreviewUrl); photoPreviewUrl = null; } dialog.querySelectorAll('iframe').forEach(frame => frame.remove()); dialog.querySelectorAll('audio').forEach(audio => { audio.pause(); audio.removeAttribute('src'); }); });
  dialog.addEventListener('cancel', event => { const veil = dialog.querySelector('.editorial-lightbox'); if (veil) { event.preventDefault(); veil.remove(); } });
  dialog.addEventListener('keydown', event => { if (event.key === 'Escape' && dialog.querySelector('.editorial-lightbox')) { event.preventDefault(); dialog.querySelector('.editorial-lightbox').remove(); } });
  window.AilleursEditorial = { open };
})();
