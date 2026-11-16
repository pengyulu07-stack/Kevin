// An edited, source-linked reading shelf. A date is the source publication date, never a fabricated daily edition.
(() => {
  const articles = [
    {
      id: 'puncak-jaya', category: 'earth', date: '2026-11-16', source: 'NASA Earth Observatory',
      title: ['巴布亚山顶的冰，已经小到不再流动', 'The last ice on Puncak Jaya has stopped flowing'],
      deck: ['两张相隔 38 年的卫星图，把热带冰川的消失过程放在眼前。', 'Two satellite views, 38 years apart, make the retreat of tropical ice visible.'],
      image: 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/iotd/2026/the-last-ice-on-puncak-jaya/puncakjaya_oli2_20261019.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg',
      credit: 'NASA Earth Observatory / Lauren Dauphin',
      url: 'https://science.nasa.gov/earth/earth-observatory/the-last-ice-on-puncak-jaya/',
      body: [
        ['1988 年和 2026 年的两幅 Landsat 图像中，巴布亚查亚峰附近的山脊变化非常直观：原本连成片的蓝色冰面，如今只剩被裸露岩石隔开的几块碎片。图像采用假彩色，蓝色表示冰，棕色是岩石，因此比较的是同一片地貌，不是两张普通风景照。', 'The change near Puncak Jaya in Papua is stark in two Landsat images. In 1988, blue ice covered several connected ridges; in the 2026 view, exposed brown rock separates a few small remnants. These are false-color satellite images: blue marks ice and brown marks rock. Reading the color key matters, because the comparison is about land cover rather than the apparent beauty of two photographs.'],
        ['NASA 引用印尼气象气候地球物理局研究人员 Donaldi Permana 的数据：1988 年冰川面积约为 4.31 平方公里，到 2025 年 9 月只剩约 0.09 平方公里。NASA 在文章中没有把这个面积当作 2026 年的最终测量；计划中的航测仍要估算那一年还剩多少冰。', 'NASA cites climate scientist Donaldi Permana of Indonesia’s meteorology agency: the glaciers occupied roughly 4.31 square kilometers in 1988, while satellite and aerial measurements found about 0.09 square kilometers remaining in September 2025. That is around two percent of the earlier extent. The figure is not a final measurement for 2026. An aerial survey was planned to estimate what remained that year, so the article distinguishes the dated measurement from the newer image.'],
        ['消失的不只是面积。主要监测点的冰厚从 2010 年的 32 米降至 2023 年的 4 米，2024 年 11 月该点的冰已经消失。冰体碎裂后边缘增多，也让融化继续加快。即使山上仍会降雪，雪也难以在新露出的岩石上积成新的冰。', 'Area is only part of the story. At the main monitoring site, ice thickness fell from 32 meters in 2010 to 4 meters in 2023; by November 2024, ice at that site had disappeared. Fragmentation exposes more edges to warmth, helping further melt. Snow can still fall on the mountain, but NASA says it does not persist long enough on the newly bare rock to rebuild the ice.'],
        ['“冰川”需要足够厚，才能靠自身重量向下流动。研究人员认为剩余碎片已经太薄、太小，失去了这种流动能力。NASA 提到一些研究预测主要冰区可能在 2030 年左右消失，但也强调具体时间仍有不确定性。两幅图能证明显著退缩，不能单独告诉我们最后一块冰会在哪一天消失。', 'A glacier is more than a patch of frozen water: it must be thick enough to flow downhill under its own weight and have an accumulation zone. The surviving pieces have become too small and thin to function that way. NASA notes research suggesting the main ice areas could disappear around 2030, while Permana says they might go sooner under current conditions. Neither the images nor that projection fixes an exact date for the last piece of ice. The useful distinction is between a directly measured retreat, a loss of glacier function, and a forecast about the remnants.']
      ]
    },
    {
      id: 'ngc-7129', category: 'space', date: '2026-11-16', source: 'NASA APOD / Webb',
      title: ['韦布拍下恒星诞生，也拍下它们如何改变邻居', 'Webb sees young stars reshape their nursery'],
      deck: ['NGC 7129 的金色与红色区域，展示的是不同阶段的恒星和气体。', 'The gold and red regions of NGC 7129 show stars and gas at different stages.'],
      image: 'https://assets.science.nasa.gov/dynamicimage/assets/science/missions/webb/science/2026/10/STScI-01M2RAWEPQ0YFBJH9VZHV49SQT.png?crop=faces%2Cfocalpoint&fit=clip&h=1433&w=1536',
      credit: 'NASA, ESA, CSA, STScI / A. Pagan',
      url: 'https://science.nasa.gov/image-article/apod-2026-november-16-ngc-7129-star-formation-with-jets-from-webb/',
      extendedUrl: 'https://science.nasa.gov/missions/webb/nasas-webb-captures-commotion-from-nebulas-stellar-jets/',
      body: [
        ['NASA 的 11 月 16 日天文每日一图再次展示了 NGC 7129。这片距离地球约 3300 光年的恒星形成区，早在 10 月的韦布望远镜研究报道中就已得到详细解释。红色和金色不是我们用肉眼望去会看到的颜色，而是红外观测数据被处理后的可读画面。', 'NASA’s November 16 astronomy picture revisits NGC 7129, a stellar nursery about 3,300 light-years from Earth. The Webb team had explained the image in a detailed October release. Its red and gold regions are a processed view of infrared observations, rather than the colors a human eye would see by looking through a window. The image is useful because infrared light can reveal young stars behind dust that blocks ordinary visible-light views.'],
        ['画面左侧的金色区域围绕较成熟的年轻恒星。NASA 介绍，中央亮星 LkHα 234 尚未进入像太阳那样稳定的核聚变阶段，却已有太阳数倍质量。它过去喷出的物质、恒星风以及光照，把周围气体挖出空腔；部分气体被吹散，另一些则受到压缩。', 'At left, the gold-colored cavity surrounds relatively mature young stars. NASA identifies the brilliant central object as LkHα 234, a pre-main-sequence star around five to eight times the mass of the Sun. It has nearly finished gathering material but has not begun the stable hydrogen fusion of a mature star. Earlier outflows and light from this star carved a cavity into a dense cloud. Some gas was driven away, while other material was compressed. Those two effects mean young stars can both disrupt and help shape the conditions around future star formation.'],
        ['右侧红色区域藏着更早阶段的原恒星。它们仍在积累质量，同时喷出高温物质；喷流撞击周围气体，形成可见的纹理和震波。左、右两侧因此不是“好看颜色”的对照，而是一个同场的时间线：恒星尚未成熟时怎样影响环境，稍长大后又怎样重塑它。', 'The redder, clumpier region on the right holds protostars at an earlier stage. They are still accumulating mass and ejecting hot material. Those outflows strike surrounding gas, producing shocks and some of the image’s textured glow. The two sides are not simply a pleasing color contrast. They offer a rough comparison of stages in one field: how very young objects act on their surroundings and how somewhat older stars continue to reshape the cloud.'],
        ['NASA 也将这张图与退役的斯皮策望远镜图像对照。韦布的细节更多，能分辨过去模糊在一起的气体丝和背景星系。但单张照片无法展示整个形成过程的时间演化，研究人员还要结合其他波段和观测，判断不同物理作用在什么时候最重要。', 'NASA also compares Webb’s view with a prior image from the retired Spitzer telescope. Webb resolves finer gas filaments and many background galaxies that were less distinct before. That improvement does not turn a single picture into a movie of star birth. Researchers must combine these observations with other measurements and models to work out which physical processes matter most at each stage. The image is strongest when read as evidence of interacting stars and gas, with its processing and limits made clear.']
      ]
    },
    {
      id: 'silent-cinema', category: 'film', date: '2026-10-27', source: 'BFI Player',
      title: ['BFI 本月把两部默片修复版带回银幕', 'Two restored silent films lead BFI Player’s November'],
      deck: ['《Shiraz》和《Piccadilly》让修复、配乐与电影史重新相遇。', 'Shiraz and Piccadilly bring restoration, new music and film history together.'],
      image: 'https://core-cms.bfi.org.uk/sites/default/files/styles/responsive/public/2020-08/shiraz-1928-selima-seated-in-veil.jpg/1300x0/shiraz-1928-selima-seated-in-veil.jpg',
      credit: 'Shiraz: A Romance of India (1928) / BFI',
      url: 'https://www.bfi.org.uk/news/bfi-player-november-2026-line-up',
      body: [
        ['英国电影协会公布的 11 月片单，以两部默片的修复版本开场。《Shiraz: A Romance of India》讲述泰姬陵建造背后的爱情故事，BFI 的新版本配有西塔琴演奏家 Anoushka Shankar 的新配乐。《Piccadilly》则让观众重新看到安娜·梅·黄在 1920 年代伦敦夜生活中的表演。', 'The British Film Institute opened its November Player programme with restored silent films. Shiraz: A Romance of India is a 1928 film set around the story behind the Taj Mahal; the BFI version has a new score by sitar player Anoushka Shankar. Piccadilly, from 1929, places Anna May Wong in a story of London nightclub life. A restoration and a new score do more than make an old title available. They can change the conditions in which a modern audience first meets it.'],
        ['这两个选择呈现了早期电影的不同跨文化视角。前一部拍摄印度历史传说，后一部将爵士时代伦敦与亚裔演员的银幕形象放在一起。BFI 在片单中没有把它们称作同一类作品；并置是本站读片单的一种方式。', 'The pairing also opens two distinct questions of film history. Shiraz represents an Indian story in an epic form; Piccadilly connects Jazz Age London, club culture and the screen presence of a Chinese American star. The BFI announcement does not claim that the films tell one shared story. Reading them together is an editorial suggestion: watch how the films construct places and performers, then ask what restoration and presentation let us notice now.'],
        ['11 月 16 日片单又加入 Anthony Asquith 的《Underground》和 1967 年的《Stranger in the House》。前者把爱情、嫉妒和追逐放进伦敦地铁；后者把西默农式悬疑改写到 1960 年代英国青年环境。它们与月初的默片一起，显示一个片单也可以是不同年代如何处理城市空间的比较。', 'Later in the month, on November 16, the service adds Anthony Asquith’s Underground and the 1967 thriller Stranger in the House. Underground stages love, jealousy and a chase amid the London transport system. Stranger in the House updates a Simenon suspense story for a setting of 1960s British youth. Alongside the early November releases, the programme invites a comparison of how films from different decades use public spaces and changing social worlds.'],
        ['这里说的是 BFI Player 的上映安排，而不是声称所有地区都能免费收看。想看完整片单、播放条件和具体版本，可以打开 BFI 原文。', 'This is a report on the BFI Player schedule, not a claim that every film is free or available in every territory. The BFI’s page lists the full November programme and links to individual film pages. Those pages are the right place to check a title’s viewing terms, availability and the exact restoration being offered. The programme also includes later releases, so the two silent films are an entry into the month, not a description of everything on the service.']
      ]
    },
    {
      id: 'jahangir', category: 'art', date: '2026-11-12', source: 'The Metropolitan Museum of Art',
      title: ['大都会艺术博物馆将重看贾汉吉尔宫廷', 'The Met plans a wider view of Jahangir’s court'],
      deck: ['约 230 件作品将把画家、工匠和跨地域交流放在帝王叙事旁边。', 'About 230 works will place artists, craftspeople and exchange beside imperial history.'],
      image: 'https://cdn.sanity.io/images/cctd4ker/production/28fd9607b345eaec3dc0be5fe03b3cbc78ec41e9-1449x815.jpg?auto=format&fit=clip&q=75&w=1600',
      credit: 'The Metropolitan Museum of Art',
      url: 'https://www.metmuseum.org/press-releases/jahangir',
      body: [
        ['纽约大都会艺术博物馆宣布，2027 年 4 月 25 日至 8 月 15 日将举行《Radiant World: Jahangir and Mughal India》。展览计划汇集约 230 件作品，包括绘画、珠宝、织物、雕塑和装饰艺术，讨论 17 世纪初莫卧儿宫廷的艺术制作。', 'The Metropolitan Museum of Art has announced Radiant World: Jahangir and Mughal India for April 25 through August 15, 2027. The planned exhibition brings together roughly 230 works: paintings, drawings, jewels, textiles, sculpture and decorative arts. Its subject is artistic production around the early-seventeenth-century Mughal emperor Jahangir. The important word in the announcement is planned. This is a preview of a future exhibition, not a review of an installation already on view.'],
        ['大都会说展览会以皇帝的回忆录《贾汉吉尔记》为一条线索，同时把画师和工匠的工作推到前景。展出的宫廷画家包括 Abu’l Hasan、Bichitr、Balchand 和擅长自然史图像的 Ustad Mansur。如此安排意味着观众不必只通过皇帝的收藏癖来认识作品，也可以追问每一幅肖像或动物画是谁制作、怎样观察。', 'The Met says it will use Jahangir’s memoir, the Jahangirnama, as one thread, while bringing the work of artists and craftspeople forward. Named court painters include Abu’l Hasan, Bichitr and Balchand, alongside Ustad Mansur, known for close studies of the natural world. That shift in emphasis matters: visitors may see not only what an emperor owned, but how a painter studied a person, animal or object and transformed that observation into an image.'],
        ['展览还将涉及皇后 Nur Jahan 对服饰、建筑与设计的影响，以及宫廷与伊朗、中亚、非洲、中国和欧洲之间的交流。大都会举出伦勃朗受莫卧儿图像启发的绘画，说明图像如何跨越原本被当作固定边界的地区。', 'The announcement also gives space to Nur Jahan, Jahangir’s Persian wife, whose influence reached fashion, architecture and design. The court’s contacts extended across Iran, Central Asia, Africa, China and Europe. The Met points to a later Rembrandt drawing inspired by Mughal imagery as one example of images crossing the borders that art histories sometimes treat as fixed. These are curatorial claims worth testing against the objects themselves once the exhibition opens.'],
        ['目前能确认的是展览计划、部分作品类别和策展方向；具体展厅中的并置与观众体验还需要等开幕后再评价。原始新闻稿列出策展团队与后续图录，适合进一步阅读。', 'For now, the confirmed information is the proposed dates, the categories of objects and the curatorial direction. The actual juxtapositions, labels and visitor experience can only be judged after the exhibition opens. The museum’s announcement names the curatorial team and a forthcoming illustrated catalog, which should provide a fuller basis for studying how imperial patronage, individual makers and exchange are treated together. One useful question for that visit will be whether a viewer can follow the choices of named painters across several objects, rather than encounter each work only as evidence of a ruler’s taste.']
      ]
    },
    {
      id: 'booker-2026', category: 'books', date: '2026-11-09', source: 'The Booker Prizes',
      title: ['M. John Harrison 凭《The End of Everything》获布克奖', 'M. John Harrison wins the 2026 Booker Prize'],
      deck: ['一部 198 页的末日小说，为什么让评委谈起解释世界的失败？', 'Why did a 198-page dystopian novel make judges discuss the failure of explanation?'],
      image: 'https://thebookerprizes.com/sites/default/files/styles/12_6_media_2x_huge/public/2026-11/BP2026_Shorlist_Winner_21.jpg?h=0e6feda0&itok=ztLn6TL8',
      credit: 'The Booker Prize Foundation',
      url: 'https://thebookerprizes.com/media-centre/press-releases/the-end-of-everything-by-m-john-harrison-wins-the-booker-prize-2026',
      body: [
        ['2026 年布克奖授予 M. John Harrison 的《The End of Everything》。Harrison 现年 81 岁，是该奖史上最年长的得主。这是他第 13 部小说，也是一部只有 198 页的末日讽刺作品。奖项给出的信息有新闻价值，但小说本身值得读的地方，不能只由年龄和页数决定。', 'M. John Harrison has won the 2026 Booker Prize for The End of Everything. At 81, he is the oldest winner in the prize’s history. It is his thirteenth novel, and at 198 pages it was the shortest title on this year’s shortlist. Those numbers explain why the announcement drew attention, but they are not the reason to read the book. The judges’ account points instead to a strange method of asking what happens when familiar explanations no longer work.'],
        ['故事设在未来的英格兰海岸。海滩拾荒者 Phillip 与持枪的姑妈 Marnie 在灾后世界中生活，周围出现形状不稳定的“iGhetti”。评委主席 Mary Beard 认为小说一边令人不安，一边保留讽刺和一点乐观。书中并不急于解释灾难的全部机制。', 'Its story follows a beachcomber, Phillip, and his armed aunt Marnie on a near-future Kent coast after an obscure catastrophe. Shapeshifting beings called iGhetti appear, while everyday social rules have eroded. Judge chair Mary Beard describes a book that is unsettling but can also be funny and unexpectedly hopeful. The Booker materials stress that Harrison refuses to explain the disaster neatly. That uncertainty is a formal choice, not simply a missing piece of plot.'],
        ['Harrison 谈创作时把现实政治和 2008 年金融危机列为灵感来源。他希望写一种关于“解释失效”的小说，而不把外来生物说明得像传统科幻设定手册。评委则把他多年写科幻、奇幻和实验小说的经历，视作这次获奖的重要背景。', 'Harrison has traced the book’s concerns to current affairs and the 2008 financial crisis. He wanted to write about a failure of explanation in society, and said he deliberately avoided defining the iGhetti too clearly. Booker representatives describe his long career across science fiction and experimental fiction as part of the significance of the award. The novel’s approach suggests that uncertainty is lived by its characters before it is solved, if it is solved at all.'],
        ['这里依据的是布克奖官方材料，而不是本站已读完小说后的书评。想判断它是否真的做到这些，仍需要阅读原作，尤其留意它短章节的节奏和人物如何面对不确定。布克奖页面另有作品介绍和作者访谈。', 'This account is based on the Booker Prize announcement, not a claim that this site has completed a close reading of the novel. To judge whether those ideas work on the page, readers need the book itself. Its short chapters, the relationship between Phillip and Marnie, and what the narrative leaves unexplained are better questions to carry into that reading than a prize headline alone. The official page includes a fuller description and links to Harrison’s own comments.']
      ]
    },
    {
      id: 'atmosphere', category: 'music', date: '2026-11-10', source: 'Rhymesayers Entertainment',
      title: ['Atmosphere 新专辑从怀旧转向告别', 'Atmosphere announces Good Bye Make Party'],
      deck: ['Slug 与 Ant 宣布新唱片，首支单曲叫《Nostalgia》。', 'Slug and Ant announce a new record and its first single, Nostalgia.'],
      image: 'https://i.ytimg.com/vi/3sYhhUqRTXc/hqdefault.jpg',
      credit: 'Rhymesayers / Atmosphere video thumbnail',
      url: 'https://rhymesayers.com/blogs/news/atmosphere-good-bye-make-party',
      body: [
        ['独立厂牌 Rhymesayers 11 月 10 日宣布，Atmosphere 的新专辑《Good Bye Make Party》预计于 2027 年 1 月 15 日发行，共 11 首歌，同时推出首支单曲《Nostalgia》。这是一则发行预告；完整专辑尚未面世，因而关于整张唱片声音的判断仍应谨慎。', 'Independent label Rhymesayers announced on November 10 that Atmosphere’s Good Bye Make Party is scheduled for worldwide release on January 15, 2027. The eleven-song album is available for preorder, and its first single, Nostalgia, accompanies the announcement. This is a release notice, not an album review: the whole record is not yet available for a fair front-to-back judgment. The useful question now is what the artists and label say they are trying to make.'],
        ['厂牌将唱片概括为对时间、记忆、衰老、爱与孤独的思考。Slug 的歌词据称会回看明尼阿波利斯的街道、旧关系和年轻时的自己；Ant 则以鼓组和带有灵魂乐气息的配器支撑这些回忆。这个描述来自发行方，兼有宣传目的。', 'Rhymesayers frames the record around time, memory, aging, love and loneliness. According to its announcement, Slug looks back at Minneapolis, old relationships and versions of himself, moving between regret and gratitude. Ant’s production is described as warm and intimate, with soulful instrumentation under his characteristic drums. Those descriptions are the label’s interpretation of a forthcoming album and have a promotional purpose. They are best treated as a stated intention to compare with the finished music later.'],
        ['标题的“告别”因此未必指组合结束。发行方解释，它更像是离开过去的某个派对：承认时间向前，而不必把曾经的自己重演一遍。第一支单曲叫《Nostalgia》，使这一层矛盾更有趣——一边回望，一边试着不困在回望里。', 'The title’s goodbye is not presented as an announcement that the duo is ending. In the label’s telling, it is a way to leave an earlier party: acknowledge what mattered without trying to reenact an old self. A first single called Nostalgia makes that tension more interesting. The music can invite memory while the album’s proposed direction asks what comes after it. How clearly the songs hold that tension will be a question for the January release.'],
        ['本站保留原公告与单曲出处，让用户自己判断这套说法是否符合实际音乐。歌曲的试听和视频版本如可在站内嵌入，应该放在播放区，而不是把整篇介绍变成跳转按钮。', 'The announcement and first single provide a starting point for listening, not a substitute for it. Readers can use the source page to check the release details and hear the first track, then return to the broader question of how memory sounds in the completed record. Where an authorized preview or video can play on this site, it belongs in a listening area rather than replacing the article with a row of outbound buttons.']
      ]
    }
  ];
  const categories = [['all','全部','All'], ['music','音乐','Music'], ['film','电影','Film'], ['art','艺术','Art'], ['books','书籍','Books'], ['politics','政治','Politics'], ['technology','科技','Technology'], ['earth','地球','Earth'], ['space','宇宙','Space']];
  const zh = () => window.DaytoneLanguage?.get() === 'zh';
  const word = pair => pair[zh() ? 0 : 1];
  const el = (tag, cls = '', text = '') => { const node = document.createElement(tag); if (cls) node.className = cls; if (text) node.textContent = text; return node; };
  const dialog = el('dialog', 'ailleurs-news-dialog'); document.body.append(dialog);
  let category = 'all', visible = 4, feed = null, feedCheckDay = '', feedLoading = false, activeHost = null;
  const todayInShanghai = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function loadFeed(){
    const date=todayInShanghai();
    if(feedLoading||feedCheckDay===date)return;
    feedCheckDay=date;feedLoading=true;
    void fetch('news-feed.json?edition='+date,{cache:'no-store'}).then(response=>{if(!response.ok)throw Error('feed unavailable');return response.json();}).then(value=>{
      if(value?.kind==='source_briefs'&&value?.categories)feed=value;
    }).catch(()=>{}).finally(()=>{feedLoading=false;if(activeHost?.isConnected)render(activeHost);});
  }
  function openBrief(item){
    dialog.replaceChildren();
    const close=el('button','ailleurs-news-close','×');close.type='button';close.setAttribute('aria-label',word(['关闭','Close']));close.onclick=()=>dialog.close();
    const date=new Date(item.published_at).toLocaleString(zh()?'zh-CN':'en-US',{timeZone:'Asia/Shanghai',year:'numeric',month:'short',day:'numeric'});
    const head=el('div','ailleurs-news-article-head');head.append(close,el('small','',item.source+' · '+date),el('h2','',item.title));
    dialog.append(head);
    if(item.image){const figure=el('figure'),image=el('img');image.src=item.image;image.alt='';figure.append(image,el('figcaption','',item.source));dialog.append(figure);}
    const content=el('div','ailleurs-news-article-body');
    content.append(el('p','',item.summary||word(['这个来源没有提供摘要；标题和发布时间已核对到原始页面。','This source did not provide a usable excerpt. The title and publication time link to the original page.'])));
    content.append(el('p','ailleurs-news-brief-note',word(['这是来源短讯，不是本站的完整报道。阅读原文可核对详情。','This is a source brief, not a full AILLEURS article. Open the original to check the details.'])));
    const links=el('div','ailleurs-news-links'),original=el('a','',word(['阅读原始报道 ↗','Read the original ↗']));
    original.href=item.url;original.target='_blank';original.rel='noopener noreferrer';links.append(original);dialog.append(content,links);dialog.showModal();
  }
  const suggestDialog=el('dialog','ailleurs-news-suggest');
  suggestDialog.innerHTML='<form><button type="button" class="ailleurs-news-close" aria-label="Close">×</button><small>AILLEURS / NEWS</small><h2>Suggest a story</h2><p>Paste a source link. An editor checks it before anything appears in News.</p><label>Category<select name="category"></select></label><label>Source URL<input name="url" type="url" required placeholder="https://…"></label><label>What caught your attention? <span>(optional)</span><textarea name="note" maxlength="500" rows="4"></textarea></label><p class="ailleurs-news-suggest-error" role="alert"></p><button type="submit">Send for review ↗</button></form>';
  document.body.append(suggestDialog);
  suggestDialog.querySelector('.ailleurs-news-close').onclick=()=>suggestDialog.close();
  for(const [key,cn,en] of categories.filter(item=>item[0]!=='all')){const option=el('option','',zh()?cn:en);option.value=key;suggestDialog.querySelector('select').append(option);}
  suggestDialog.querySelector('form').addEventListener('submit',async event=>{
    event.preventDefault();if(!requireAccount())return;
    const form=event.currentTarget,error=form.querySelector('.ailleurs-news-suggest-error'),button=form.querySelector('button[type="submit"]');
    error.textContent='';
    let url;
    try{url=new URL(form.elements.url.value.trim());if(url.protocol!=='https:')throw Error();}catch{error.textContent=word(['请输入有效的 https 链接。','Enter a valid https link.']);return;}
    const note=form.elements.note.value.trim();
    const message=['[NEWS SUGGESTION]', 'Category: '+form.elements.category.value, 'URL: '+url.href, note?'Reader note: '+note:''].filter(Boolean).join('\n');
    if(message.length>1000){error.textContent=word(['文字太长，请缩短说明。','Please shorten your note.']);return;}
    button.disabled=true;
    try{
      const day=today(),used=await client.from('feedback').select('daily_slot').eq('user_id',user.id).eq('day',day);
      if(used.error)throw used.error;
      const occupied=new Set((used.data||[]).map(item=>item.daily_slot));
      let saved=false;
      for(const slot of [1,2,3]){
        if(occupied.has(slot))continue;
        const result=await client.from('feedback').insert({user_id:user.id,day,daily_slot:slot,message});
        if(!result.error){saved=true;break;}
        if(result.error.code!=='23505')throw result.error;
      }
      if(!saved)throw Error(word(['今天已提交三条建议。','You have sent three suggestions today.']));
      form.reset();suggestDialog.close();toast(word(['链接已送交编辑核对。','Your link was sent for review.']));
    }catch(cause){error.textContent=cause.message||word(['提交失败，请重试。','Could not send the link.']);}
    finally{button.disabled=false;}
  });
  function openSuggestion(){
    if(!requireAccount())return;
    suggestDialog.querySelector('h2').textContent=word(['推荐一条新闻','Suggest a story']);
    suggestDialog.querySelector('p').textContent=word(['粘贴原始报道链接。核对后才会出现在新闻中。','Paste a source link. An editor checks it before anything appears in News.']);
    for(const option of suggestDialog.querySelector('select').options){const entry=categories.find(item=>item[0]===option.value);if(entry)option.textContent=zh()?entry[1]:entry[2];}
    suggestDialog.querySelector('.ailleurs-news-suggest-error').textContent='';
    suggestDialog.showModal();
  }
  function open(article) {
    dialog.replaceChildren();
    const close = el('button', 'ailleurs-news-close', '×'); close.type = 'button'; close.setAttribute('aria-label', word(['关闭','Close'])); close.onclick = () => dialog.close();
    const header = el('div', 'ailleurs-news-article-head'); header.append(close, el('small', '', article.source + ' · ' + article.date), el('h2', '', word(article.title)), el('p', '', word(article.deck)));
    const figure = el('figure'); const image = el('img'); image.src = article.image; image.alt = word(article.title); figure.append(image, el('figcaption', '', article.credit));
    const content = el('div', 'ailleurs-news-article-body'); article.body.forEach(pair => content.append(el('p', '', word(pair))));
    const links = el('div', 'ailleurs-news-links'); const original = el('a', '', word(['阅读原始报道 ↗','Read the full original ↗'])); original.href = article.url; original.target = '_blank'; original.rel = 'noopener noreferrer';
    if (article.extendedUrl) { const extended = el('a', '', word(['阅读详细研究 ↗','Read the detailed report ↗'])); extended.href = article.extendedUrl; extended.target = '_blank'; extended.rel = 'noopener noreferrer'; links.append(extended); }
    const search = el('a', '', word(['搜索更多资料 ↗','Search for more coverage ↗'])); search.href = 'https://www.google.com/search?q=' + encodeURIComponent(word(article.title) + ' ' + article.source); search.target = '_blank'; search.rel = 'noopener noreferrer'; links.append(original, search);
    dialog.append(header, figure, content, links); dialog.showModal();
  }
  function render(host) {
    activeHost=host;loadFeed();host.replaceChildren();
    const head=el('div','ailleurs-news-head');
    head.append(el('small','',word(['每日新闻 / 亚洲上海时间','DAILY NEWS / SHANGHAI TIME'])),el('h3','',word(['今天的新闻','Today’s news'])),el('p','',word(['每天早晨更新来源短讯；深入文章由编辑核对后发布。','Source briefs refresh each morning. Longer features appear after editorial review.'])));
    const suggest=el('button','ailleurs-news-suggest-button',word(['＋ 推荐新闻链接','＋ Suggest a story']));suggest.type='button';suggest.onclick=openSuggestion;head.append(suggest);host.append(head);
    const filters=el('div','ailleurs-news-filters');
    for(const [key,cn,en] of categories){const button=el('button',key===category?'active':'',zh()?cn:en);button.type='button';button.setAttribute('aria-pressed',String(key===category));button.onclick=()=>{category=key;visible=4;render(host);};filters.append(button);}
    host.append(filters);
    const status=el('p','ailleurs-news-edition');
    if(feed){const fresh=feed.edition_date===todayInShanghai();status.textContent=fresh?word(['今天的来源短讯 · '+feed.edition_date,'Source briefs for '+feed.edition_date]):word(['最近一次更新：'+feed.edition_date+'；今天的内容仍在等待更新。','Last update: '+feed.edition_date+'. Today’s edition is still pending.']);}
    else status.textContent=feedLoading?word(['正在读取新闻来源…','Loading sources…']):word(['暂时无法读取每日新闻。','Daily news is temporarily unavailable.']);
    host.append(status);
    const sourceRows=feed?.categories?Object.entries(feed.categories).flatMap(([key,items])=>(items||[]).map(item=>({...item,category:key}))):[];
    const visibleRows=sourceRows.filter(item=>category==='all'||item.category===category).sort((a,b)=>b.published_at.localeCompare(a.published_at));
    const list=el('div','ailleurs-news-list');
    for(const item of visibleRows.slice(0,visible)){
      const card=el('button','ailleurs-news-card');card.type='button';
      if(item.image){const image=el('img');image.src=item.image;image.alt='';image.loading='lazy';card.append(image);}
      else card.append(el('div','ailleurs-news-no-image',item.source));
      const copy=el('span');copy.append(el('small','',item.source+' · '+item.published_at.slice(0,10)),el('strong','',item.title));
      if(item.summary)copy.append(el('em','',item.summary));copy.append(el('b','',word(['在这里看短讯','Read source brief'])));card.append(copy);card.onclick=()=>openBrief(item);list.append(card);
    }
    if(!visibleRows.length&&!feedLoading)list.append(el('p','ailleurs-news-empty',word(['这个分类暂时没有近期来源短讯。','No recent source brief in this category yet.'])));
    host.append(list);
    if(visible<visibleRows.length){const more=el('button','ailleurs-news-more',word(['继续往下看 ↓','Show more ↓']));more.type='button';more.onclick=()=>{visible+=4;render(host);};host.append(more);}
    const feature=el('section','ailleurs-news-features');
    feature.append(el('small','',word(['编辑阅读','EDITORIAL READING'])),el('h3','',word(['深入了解','Read further'])));
    const edited=[...articles].filter(item=>category==='all'||item.category===category).sort((a,b)=>b.date.localeCompare(a.date));
    const featureList=el('div','ailleurs-news-feature-list');
    for(const article of edited){const card=el('button','ailleurs-news-feature');card.type='button';card.append(el('small','',article.source+' · '+article.date),el('strong','',word(article.title)),el('span','',word(article.deck)));card.onclick=()=>open(article);featureList.append(card);}
    if(!edited.length)featureList.append(el('p','ailleurs-news-empty',word(['这个分类还没有经过编辑的长文章。','No edited long article in this category yet.'])));
    feature.append(featureList);host.append(feature);
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&activeHost?.isConnected){feedCheckDay='';loadFeed();}});
  window.AilleursNews = { render, open };
})();
