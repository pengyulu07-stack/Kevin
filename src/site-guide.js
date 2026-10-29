/* A concise guide that follows the actual DAYTONE screens. */
(() => {
  const dialog = el('dialog','site-guide');dialog.id='site-guide';dialog.setAttribute('data-no-translate','');document.body.append(dialog);
  const content = {
    en: [
      ['01','Make your identity','Sign up with a six-digit ID, a password, and a nickname. Use the same ID and password on another device.'],
      ['02','Pick a date','Choose a day on the paper calendar. Its top songs and latest forums appear immediately below. Use the top bar to open any section; Begin Today opens the cinema entrance.'],
      ['03','Find your music','Music charts holds the public chart, categories, followed charts, and private groups. The daily Top 5 is chosen by Vote; six emoji reactions express feelings without changing rank. Every song stays in the full list.'],
      ['04','Share and revise','Post a song in one to three categories. Each account may post eight songs per category and language chart each day. Use Edit on your own song, forum, playlist, or reply to change it later.'],
      ['05','Make a category or group','New category creates a public chart for everyone; each account can create up to three. Private groups need a code and password, and only joined members can see their contents.'],
      ['06','Keep a playlist','The Long Play keeps playlists beyond a single day. Paste track names, check them, add a cover, and let friends copy individual song titles. A platform link alone cannot reliably import every track.'],
      ['07','Stay in touch','Use the bell for notifications. Settings controls which activity appears and lets you choose your entrance background.']
    ],
    zh: [
      ['01','建立身份','用六位登录号、密码和昵称注册。换设备后使用相同登录号和密码。'],
      ['02','选择日期','在纸质日历上选一天，下方立刻显示当天热门歌曲与最新论坛。顶部导航可直达各区；“开始今天”会进入电影式入口。'],
      ['03','找到想听的歌','音乐榜单包含公开总榜、分类榜、关注的榜单和私人小组。每日前五由独立投票决定；六个表情只表达感受，不影响名次。其他歌曲都在完整列表。'],
      ['04','分享后继续修改','一首歌可选一到三个分类。每个账号每天每个分类和语言榜最多分享八首歌。自己发布的歌曲、论坛、歌单和回复可点“编辑”修改。'],
      ['05','建立分类或小组','“新建分类”会产生所有人可见的公开榜单，每个账号最多建立三个。私人小组用代码和密码加入，只有成员能查看。'],
      ['06','保存长久歌单','“长久歌单”不会随日期清空。粘贴歌曲名称、检查曲目、添加封面，朋友可以逐首复制歌名。仅凭平台链接还不能稳定导入全部曲目。'],
      ['07','查看通知','右上角铃铛显示通知。设置中可调整通知范围及入口背景。']
    ]
  };
  function render(){const lang=window.DaytoneLanguage?.get()||'en';dialog.replaceChildren();const shell=el('div','site-guide-shell'),head=el('div','dialog-head'),titles=el('div');titles.append(el('p','kicker',lang==='zh'?'DAYTONE / 使用教程':'DAYTONE / A SHORT GUIDE'),el('h2','',lang==='zh'?'从今天开始':'Start with today'));const close=el('button','','×');close.type='button';close.setAttribute('aria-label',lang==='zh'?'关闭':'Close');close.addEventListener('click',()=>dialog.close());head.append(titles,close);shell.append(head);const list=el('div','site-guide-steps');for(const [number,title,body] of content[lang]){const step=el('section','site-guide-step');step.append(el('small','',number),el('h3','',title),el('p','',body));list.append(step);}shell.append(list);dialog.append(shell);}
  document.getElementById('site-guide-open').addEventListener('click',()=>{render();dialog.showModal();});
  window.addEventListener('daytone:language',()=>{if(dialog.open)render();});
})();
