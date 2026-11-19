/* One visible, official YouTube player across sharing, reading and listening. */
(() => {
  const tr = (cn, en) => window.DaytoneLanguage?.get() === 'zh' ? cn : en;
  const instances = new Map();
  let api;
  function loadAPI() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (api) return api;
    api = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      const timeout = setTimeout(() => { api = null; reject(Error('timeout')); }, 12000);
      window.onYouTubeIframeAPIReady = () => { clearTimeout(timeout); previous?.(); resolve(window.YT); };
      let script = document.querySelector('script[data-ailleurs-youtube]');
      if (!script) { script = document.createElement('script'); script.src = 'https://www.youtube.com/iframe_api'; script.dataset.ailleursYoutube = ''; document.head.append(script); }
      script.onerror = () => { clearTimeout(timeout); script.remove(); api = null; reject(Error('network')); };
    });
    return api;
  }
  function claim(owner) {
    document.querySelectorAll('audio,video').forEach(media => { if (media !== owner) media.pause(); });
    for (const [host, item] of instances) if (host !== owner) { try { item.player?.pauseVideo(); } catch {} }
    window.dispatchEvent(new CustomEvent('ailleurs:media-play', {detail:{owner}}));
  }
  document.addEventListener('play', event => { if (event.target.matches?.('audio,video')) claim(event.target); }, true);
  const errorText = code => ({
    2: tr('这个视频链接无效。请选择其他版本。', 'This video link is invalid. Choose another version.'),
    5: tr('浏览器无法播放这个视频。可重试或选择其他版本。', 'Your browser could not play this video. Retry or choose another version.'),
    100: tr('这个视频已删除或设为私密。请选择其他版本。', 'This video was removed or made private. Choose another version.'),
    101: tr('上传者禁止站外播放。可选择其他版本，或在 YouTube 打开。', 'The uploader has disabled embedded playback. Choose another version or open YouTube.'),
    150: tr('上传者禁止站外播放。可选择其他版本，或在 YouTube 打开。', 'The uploader has disabled embedded playback. Choose another version or open YouTube.'),
    153: tr('YouTube 未识别此页面。请重试或在 YouTube 打开。', 'YouTube could not identify this page. Retry or open YouTube.')
  }[code] || tr('视频暂时无法播放。可重试或选择其他版本。', 'The video cannot play right now. Retry or choose another version.'));
  function mount(host, videos, options = {}) {
    destroy(host); host.replaceChildren(); host.classList.add('music-video');
    const valid = videos.filter(video => /^[\w-]{11}$/.test(video.id));
    if (!valid.length) return;
    const stage = document.createElement('div'); stage.className = 'music-video-stage';
    const caption = document.createElement('div'); caption.className = 'music-video-caption';
    const heading = document.createElement('strong'), credit = document.createElement('small');
    const source = document.createElement('a'); source.target = '_blank'; source.rel = 'noopener noreferrer'; source.textContent = 'YouTube ↗';
    const status = document.createElement('p'); status.className = 'music-video-status'; status.setAttribute('role','status'); status.hidden = true;
    const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'music-video-retry'; retry.textContent = tr('重试', 'Retry'); retry.hidden = true;
    const choices = document.createElement('div'); choices.className = 'music-video-options'; choices.setAttribute('aria-label',tr('选择视频版本','Choose a video version'));
    caption.append(heading, credit, source); host.append(stage,caption,status,retry,choices);
    const state = { player:null, token:0, timer:null, observer:null }; instances.set(host,state);
    let selected = valid[0];
    const message = (text, canRetry = false) => { status.textContent = text; status.hidden = !text; retry.hidden = !canRetry; };
    async function start() {
      const token = ++state.token;
      clearTimeout(state.timer); try { state.player?.destroy(); } catch {} state.player = null;
      claim(host);
      stage.replaceChildren(); const frame = document.createElement('iframe');
      const url = new URL('https://www.youtube-nocookie.com/embed/' + selected.id);
      url.search = new URLSearchParams({enablejsapi:'1',origin:location.origin,playsinline:'1',rel:'0',autoplay:'1'});
      if(options.muted)url.searchParams.set('mute','1');
      frame.src = url.href; frame.title = (selected.name || selected.title || options.title || '') + ' — YouTube';
      frame.referrerPolicy = 'strict-origin-when-cross-origin'; frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; frame.allowFullscreen = true;
      stage.append(frame); message(tr('正在连接 YouTube…', 'Connecting to YouTube…'));
      state.timer = setTimeout(() => { if(token === state.token)message(tr('连接较慢。可继续点击播放器，或重试。', 'The connection is taking longer. Try the player or retry.'),true); },15000);
      try {
        const YT = await loadAPI(); if(token !== state.token || !host.isConnected) return;
        state.player = new YT.Player(frame,{events:{
          onReady: () => { if(token !== state.token)return; clearTimeout(state.timer); message(''); },
          onStateChange: event => { if(token !== state.token)return; host.dispatchEvent(new CustomEvent('ailleurs:video-state',{detail:{id:selected.id,state:event.data}}));if(event.data === 1){clearTimeout(state.timer);message('');claim(host);} },
          onError: event => { if(token !== state.token)return;clearTimeout(state.timer);host.dispatchEvent(new CustomEvent('ailleurs:video-error',{detail:{id:selected.id,code:event.data}}));message(errorText(event.data),true); },
          onAutoplayBlocked: () => { if(token !== state.token)return;clearTimeout(state.timer);message(tr('点击播放器中的播放按钮即可继续。','Press play in the player to continue.')); }
        }});
      } catch { if(token === state.token) {clearTimeout(state.timer);message(tr('播放状态暂时无法读取；仍可尝试上方播放器。','Playback status is unavailable; you can still try the player above.'),true);} }
    }
    function choose(video, play = false) {
      selected = video; ++state.token; clearTimeout(state.timer); try { state.player?.destroy(); } catch {} state.player = null;
      heading.textContent = video.name || video.title || options.title || 'Video';
      credit.textContent = [video.kind,video.channel || video.artist].filter(Boolean).join(' · ');
      source.href = 'https://www.youtube.com/watch?v=' + video.id;
      [...choices.children].forEach((button,index) => button.setAttribute('aria-pressed',String(valid[index] === video)));
      message(''); stage.replaceChildren();
      if(play) { void start(); return; }
      const poster = document.createElement('button'); poster.type = 'button'; poster.className = 'music-video-poster'; poster.setAttribute('aria-label',tr('播放完整视频：','Play full video: ') + heading.textContent);
      const image = document.createElement('img'); image.src = 'https://i.ytimg.com/vi/'+video.id+'/hqdefault.jpg'; image.alt = ''; image.loading = 'lazy';
      const icon = document.createElement('span'); icon.textContent = '▶'; poster.append(image,icon); poster.addEventListener('click',() => void start()); stage.append(poster);
    }
    for(const video of valid) {
      const button = document.createElement('button');button.type = 'button';
      const image = document.createElement('img'); image.src = 'https://i.ytimg.com/vi/'+video.id+'/mqdefault.jpg'; image.alt = '';image.loading = 'lazy';
      const label = document.createElement('span');label.textContent = video.name || video.title;
      button.append(image,label);button.addEventListener('click',() => choose(video,true)); choices.append(button);
    }
    choices.hidden = valid.length < 2; retry.addEventListener('click',() => void start());
    state.observer = new MutationObserver(() => { if(!host.isConnected || host.closest('dialog:not([open])'))destroy(host); });
    state.observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
    choose(selected,Boolean(options.autoplay));
    return {play:start,destroy:() => destroy(host)};
  }
  function destroy(host) { const state = instances.get(host); if(!state)return; ++state.token;clearTimeout(state.timer);state.observer?.disconnect();try {state.player?.destroy();}catch{}instances.delete(host); }
  window.AilleursVideoPlayer = { mount, destroy, claim, errorText };
})();
