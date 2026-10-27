const $ = (id) => document.getElementById(id);
const config = window.DAYTONE_CONFIG || {};
const ready = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase?.createClient);
const client = ready ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true }
}) : null;
const emoji = ["👍", "👎", "🐶", "❤️", "😭", "🤮"];
const audioTypes = { "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/ogg": "ogg", "audio/wav": "wav", "audio/x-wav": "wav", "audio/webm": "webm" };
const imageTypes = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const validDay = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(value + "T00:00:00Z");
  return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value;
};
const addDays = (day, count) => new Date(Date.parse(day + "T00:00:00Z") + count * 86400000).toISOString().slice(0, 10);
const params = new URLSearchParams(location.search);
let selectedDay = validDay(params.get("day")) ? params.get("day") : today();
let songs = [];
let reactions = new Map();
let comments = new Map();
let user = null;
let profile = null;
let authMode = "signup";
let loadRequest = 0;
let toastTimer;

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}
function status(message) { $("status").textContent = message; }
function toast(message) {
  const node = $("toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 4000);
}
function setDay(day) {
  if (!validDay(day)) return;
  selectedDay = day;
  $("date").value = day;
  history.replaceState(null, "", "?day=" + day + location.hash);
  renderWeek();
  void loadSongs();
}
function renderWeek() {
  const rail = $("week-rail");
  rail.replaceChildren();
  for (let offset = -3; offset <= 3; offset++) {
    const day = addDays(selectedDay, offset);
    const button = el("button", "day-tile" + (offset === 0 ? " selected" : ""));
    button.type = "button";
    button.setAttribute("aria-label", "查看 " + day + " 的歌单");
    const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "short", timeZone: "UTC" }).format(new Date(day + "T12:00:00Z"));
    button.append(el("small", "", weekday), el("strong", "", day.slice(-2)));
    button.addEventListener("click", () => setDay(day));
    rail.append(button);
  }
}
function updateAccount() {
  $("account-button").textContent = profile ? profile.nickname + " · 我的账号" : (user ? "设置昵称" : "登录 / 注册");
  renderSongs();
}
function showDialog(id) {
  const dialog = $(id);
  if (!dialog.open) dialog.showModal();
}
function switchAuth(mode) {
  authMode = mode;
  const signup = mode === "signup";
  $("auth-title").textContent = signup ? "加入日听" : "欢迎回来";
  $("nickname-field").classList.toggle("hidden", !signup);
  $("auth-form").elements.nickname.required = signup;
  $("auth-form").elements.password.autocomplete = signup ? "new-password" : "current-password";
  $("show-signup").classList.toggle("selected", signup);
  $("show-signin").classList.toggle("selected", !signup);
  $("submit-auth").textContent = signup ? "创建账号 ↗" : "登录日听 ↗";
  $("auth-error").textContent = "";
}
function openAuth(mode = "signup") {
  if (!client) { toast("网站后台尚未连接。"); return; }
  switchAuth(mode);
  showDialog("auth-dialog");
}
function openProfile() {
  if (!user) { openAuth("signin"); return; }
  $("profile-form").elements.nickname.value = profile?.nickname || user.user_metadata?.nickname || "";
  $("profile-error").textContent = "";
  showDialog("profile-dialog");
}
function requireAccount() {
  if (!client) { toast("网站后台尚未连接。"); return false; }
  if (!user) { openAuth("signup"); toast("先设置登录号和昵称，就能参与分享。"); return false; }
  if (!profile) { openProfile(); toast("先保存你的昵称。"); return false; }
  return true;
}
async function hydrateProfile() {
  if (!client || !user) return;
  const actor = user;
  let result = await client.from("profiles").select("nickname").eq("user_id", actor.id).maybeSingle();
  if (result.error) { toast("昵称读取失败，请稍后重试。"); return; }
  if (!result.data) {
    const nickname = String(actor.user_metadata?.nickname || "").trim().slice(0, 30);
    if (nickname) {
      const inserted = await client.from("profiles").insert({ user_id: actor.id, nickname }).select("nickname").single();
      if (!inserted.error) result = inserted;
      else result = await client.from("profiles").select("nickname").eq("user_id", actor.id).maybeSingle();
    }
  }
  if (user?.id !== actor.id) return;
  profile = result.data || null;
  updateAccount();
  if (!profile) openProfile();
}
async function submitAuth(event) {
  event.preventDefault();
  if (!client) return;
  const form = $("auth-form");
  const id = String(form.elements.login_id.value).trim();
  const password = form.elements.password.value;
  const nickname = String(form.elements.nickname.value).trim();
  if (!/^\d{6}$/.test(id)) { $("auth-error").textContent = "请输入六位数字登录号。"; return; }
  if (password.length < 8) { $("auth-error").textContent = "密码至少需要 8 位。"; return; }
  if (authMode === "signup" && !nickname) { $("auth-error").textContent = "注册时请填写昵称。"; return; }
  const button = $("submit-auth");
  button.disabled = true;
  $("auth-error").textContent = "";
  try {
    const email = id + "@daytone.invalid";
    const response = authMode === "signup"
      ? await client.auth.signUp({ email, password, options: { data: { nickname } } })
      : await client.auth.signInWithPassword({ email, password });
    if (response.error) throw response.error;
    if (!response.data.session || !response.data.user) throw new Error("账号尚未启用，请联系站长检查登录设置。");
    user = response.data.user;
    await hydrateProfile();
    $("auth-dialog").close();
    toast(authMode === "signup" ? "账号已创建，请记住六位登录号和密码。" : "欢迎回来。");
    form.elements.password.value = "";
  } catch (error) {
    const message = String(error.message || "");
    $("auth-error").textContent = error.code === "user_already_exists" || /already registered/i.test(message)
      ? "这个六位号码已被注册，请换一个。"
      : /Invalid login credentials/i.test(message) ? "登录号或密码不正确。"
      : /invalid email/i.test(message) ? "数字账号尚未配置好，请联系站长。"
      : message || "暂时无法登录，请稍后重试。";
  } finally { button.disabled = false; }
}
async function submitProfile(event) {
  event.preventDefault();
  if (!user) { openAuth("signin"); return; }
  const nickname = String($("profile-form").elements.nickname.value).trim();
  if (!nickname || nickname.length > 30) { $("profile-error").textContent = "昵称需要 1 到 30 个字。"; return; }
  const button = $("save-profile");
  button.disabled = true;
  try {
    const { error } = await client.from("profiles").upsert({
      user_id: user.id, nickname, updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
    if (error) throw error;
    profile = { nickname };
    $("profile-dialog").close();
    updateAccount();
    toast("昵称已保存。");
  } catch (error) { $("profile-error").textContent = error.message || "昵称保存失败。"; }
  finally { button.disabled = false; }
}
async function signOut() {
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) { toast("退出失败，请稍后重试。"); return; }
  user = null;
  profile = null;
  $("profile-dialog").close();
  updateAccount();
  toast("已退出。");
}
async function loadSongs() {
  if (!client) { status("页面预览：共享数据库尚未连接。"); $("empty").hidden = false; return; }
  const request = ++loadRequest;
  const day = selectedDay;
  status("正在读取这一天的歌单…");
  try {
    const result = await client.from("songs").select("id,owner_id,day,daily_slot,title,artist,nickname,note,audio_path,source_url,cover_path,created_at").eq("day", day).order("created_at", { ascending: false }).limit(100);
    if (result.error) throw result.error;
    const nextSongs = result.data || [];
    const nextReactions = new Map();
    const nextComments = new Map();
    if (nextSongs.length) {
      const ids = nextSongs.map((song) => song.id);
      const [reactionResult, commentResult] = await Promise.all([
        client.from("reactions").select("song_id,user_id,emoji").in("song_id", ids).limit(1000),
        client.from("comments").select("id,song_id,user_id,nickname,body,image_path,created_at").in("song_id", ids).order("created_at", { ascending: true }).limit(1000)
      ]);
      if (reactionResult.error) throw reactionResult.error;
      if (commentResult.error) throw commentResult.error;
      for (const row of reactionResult.data || []) {
        const list = nextReactions.get(row.song_id) || [];
        list.push(row);
        nextReactions.set(row.song_id, list);
      }
      for (const row of commentResult.data || []) {
        const list = nextComments.get(row.song_id) || [];
        list.push(row);
        nextComments.set(row.song_id, list);
      }
    }
    if (request !== loadRequest) return;
    songs = nextSongs;
    reactions = nextReactions;
    comments = nextComments;
    renderSongs();
    status(songs.length ? "已同步 " + day + " 的歌单。" : "这一天还没有分享。");
  } catch (error) {
    if (request !== loadRequest) return;
    status("暂时无法读取歌单：" + (error.message || "请稍后重试"));
    $("empty").hidden = false;
  }
}
function renderSongs() {
  const filter = $("search").value.trim().toLocaleLowerCase();
  const visible = songs.filter((song) => (song.title + " " + song.artist + " " + song.nickname).toLocaleLowerCase().includes(filter));
  $("song-count").textContent = String(visible.length);
  const list = $("song-list");
  list.replaceChildren();
  $("empty").hidden = visible.length > 0;
  for (const song of visible) list.append(createCard(song));
  if (location.hash.startsWith("#song-")) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "center" });
}
function publicFile(bucket, path) { return client.storage.from(bucket).getPublicUrl(path).data.publicUrl; }
function createCard(song) {
  const card = el("article", "song-card");
  card.id = "song-" + song.id;
  const art = el("div", "song-art tone-" + (song.title.length % 4) + (song.cover_path ? " has-image" : ""));
  if (song.cover_path) {
    const image = el("img");
    image.src = publicFile("images", song.cover_path);
    image.alt = song.title + " 的封面";
    image.loading = "lazy";
    art.append(image);
  } else art.append(el("b", "", song.title.slice(0, 2)));
  card.append(art);
  const meta = el("div", "song-meta");
  meta.append(el("h3", "", song.title));
  meta.append(el("p", "song-byline", (song.artist ? song.artist + " · " : "") + song.nickname));
  if (song.note) meta.append(el("div", "song-note", "“" + song.note + "”"));
  meta.append(el("small", "", song.day + " · " + new Date(song.created_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })));
  if (song.audio_path) {
    const audio = el("audio", "song-player");
    audio.controls = true;
    audio.preload = "none";
    audio.src = publicFile("tracks", song.audio_path);
    audio.setAttribute("aria-label", "播放 " + song.title);
    meta.append(audio);
  } else if (song.source_url) {
    const link = el("a", "open-link", "去原平台听这首歌 ↗");
    link.href = song.source_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    meta.append(link);
  }
  const bottom = el("div", "card-bottom");
  const row = el("div", "reaction-row");
  const rows = reactions.get(song.id) || [];
  for (const symbol of emoji) {
    const count = rows.filter((item) => item.emoji === symbol).length;
    const chosen = rows.some((item) => item.emoji === symbol && item.user_id === user?.id);
    const button = el("button", "reaction" + (chosen ? " chosen" : ""));
    button.type = "button";
    button.setAttribute("aria-label", symbol + " " + count + " 人回应");
    button.setAttribute("aria-pressed", String(chosen));
    button.append(document.createTextNode(symbol), el("span", "", String(count)));
    button.addEventListener("click", () => void react(song.id, symbol, chosen));
    row.append(button);
  }
  const share = el("button", "share-song", "↗");
  share.type = "button";
  share.setAttribute("aria-label", "分享 " + song.title);
  share.addEventListener("click", () => void copyLink("?day=" + song.day + "#song-" + song.id));
  bottom.append(row, share);
  meta.append(bottom);
  const section = el("section", "comment-section");
  const songComments = comments.get(song.id) || [];
  section.append(el("div", "comment-heading", "评论 · " + songComments.length));
  const commentList = el("div", "comment-list");
  if (!songComments.length) commentList.append(el("div", "comment-empty", "还没有评论，留下第一句。"));
  for (const item of songComments) {
    const entry = el("div", "comment");
    entry.append(el("strong", "", item.nickname), el("time", "", new Date(item.created_at).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })));
    if (item.body) entry.append(el("p", "", item.body));
    if (item.image_path) {
      const image = el("img");
      image.src = publicFile("images", item.image_path);
      image.alt = item.nickname + " 分享的照片";
      image.loading = "lazy";
      entry.append(image);
    }
    commentList.append(entry);
  }
  section.append(commentList);
  const form = el("form", "comment-form");
  const box = el("textarea");
  box.name = "body";
  box.maxLength = 500;
  box.rows = 2;
  box.placeholder = "写一句评论，或只发一张照片…";
  box.setAttribute("aria-label", "评论内容");
  const actions = el("div", "comment-actions");
  const image = el("input");
  image.type = "file";
  image.name = "image";
  image.accept = "image/jpeg,image/png,image/webp,image/gif";
  image.setAttribute("aria-label", "评论照片，最大 1 MB");
  const submit = el("button", "", "发布评论 ↗");
  submit.type = "submit";
  actions.append(image, submit);
  const error = el("div", "comment-error");
  error.setAttribute("role", "alert");
  form.append(box, actions, error);
  form.addEventListener("submit", (event) => void publishComment(event, song.id, error, submit));
  section.append(form);
  meta.append(section);
  card.append(meta);
  return card;
}
async function react(songId, symbol, chosen) {
  if (!requireAccount()) return;
  try {
    const query = client.from("reactions");
    const result = chosen
      ? await query.delete().eq("song_id", songId).eq("user_id", user.id)
      : await query.upsert({ song_id: songId, user_id: user.id, emoji: symbol }, { onConflict: "song_id,user_id" });
    if (result.error) throw result.error;
    await loadSongs();
  } catch (error) { toast(error.message || "回应没有保存，请稍后再试。"); }
}
async function copyLink(path) {
  const url = new URL(path, location.href).href;
  try { await navigator.clipboard.writeText(url); toast("链接已复制，可以发给朋友。"); }
  catch { toast("无法自动复制，请从浏览器地址栏复制链接。"); }
}
function openUpload() {
  if (!requireAccount()) return;
  $("form-error").textContent = "";
  showDialog("upload-dialog");
}
async function uploadFile(bucket, file, types, maxBytes) {
  if (!(file instanceof File) || !file.size) return null;
  if (file.size > maxBytes) throw new Error(bucket === "tracks" ? "音频请压缩到 8 MB 以内。" : "照片请压缩到 1 MB 以内。");
  const ext = types[file.type];
  if (!ext) throw new Error(bucket === "tracks" ? "支持 MP3、M4A、OGG、WAV 或 WebM 音频。" : "照片支持 JPG、PNG、WebP 或 GIF。");
  const path = user.id + "/" + crypto.randomUUID() + "." + ext;
  const { error } = await client.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type, cacheControl: "3600" });
  if (error) throw error;
  return path;
}
async function cleanUploads(paths) {
  for (const item of paths) {
    try { await client.storage.from(item.bucket).remove([item.path]); } catch { /* A failed cleanup can be removed by the owner later. */ }
  }
}
async function publish(event) {
  event.preventDefault();
  if (!requireAccount()) return;
  const form = $("upload-form");
  const data = new FormData(form);
  const title = String(data.get("title") || "").trim();
  const artist = String(data.get("artist") || "").trim();
  const note = String(data.get("note") || "").trim();
  const source = data.get("source");
  const file = data.get("file");
  const cover = data.get("cover");
  const urlText = String(data.get("url") || "").trim();
  const errorNode = $("form-error");
  errorNode.textContent = "";
  if (!title) { errorNode.textContent = "请填写歌名。"; return; }
  let sourceUrl = null;
  if (source === "link" && urlText) {
    try {
      const parsed = new URL(urlText);
      if (parsed.protocol !== "https:") throw new Error();
      sourceUrl = parsed.href;
    } catch { errorNode.textContent = "音乐链接需要以 https:// 开头。"; return; }
  }
  const button = $("submit-song");
  button.disabled = true;
  button.textContent = "正在发布…";
  const uploaded = [];
  try {
    const day = today();
    const usedResult = await client.from("songs").select("daily_slot").eq("owner_id", user.id).eq("day", day);
    if (usedResult.error) throw usedResult.error;
    const used = new Set((usedResult.data || []).map((item) => item.daily_slot));
    if (used.size >= 3) throw new Error("今天已分享三首，明天再来吧。");
    let audioPath = null;
    let coverPath = null;
    if (source === "file") {
      audioPath = await uploadFile("tracks", file, audioTypes, 8 * 1024 * 1024);
      if (audioPath) uploaded.push({ bucket: "tracks", path: audioPath });
    }
    coverPath = await uploadFile("images", cover, imageTypes, 1024 * 1024);
    if (coverPath) uploaded.push({ bucket: "images", path: coverPath });
    const song = {
      id: crypto.randomUUID(), owner_id: user.id, day, title, artist, nickname: profile.nickname, note,
      audio_path: audioPath, source_url: sourceUrl, cover_path: coverPath,
      file_size: audioPath ? file.size : null
    };
    let saved = false;
    for (const slot of [1, 2, 3]) {
      if (used.has(slot)) continue;
      const result = await client.from("songs").insert({ ...song, daily_slot: slot });
      if (!result.error) { saved = true; break; }
      if (result.error.code !== "23505") throw result.error;
    }
    if (!saved) throw new Error("今天已分享三首，明天再来吧。");
    form.reset();
    $("upload-dialog").close();
    setDay(day);
    toast("已经分享到今天的歌单。");
  } catch (error) {
    await cleanUploads(uploaded);
    errorNode.textContent = error.message || "发布失败，请稍后再试。";
  } finally { button.disabled = false; button.textContent = "发布这首歌 ↗"; }
}
async function publishComment(event, songId, errorNode, button) {
  event.preventDefault();
  if (!requireAccount()) return;
  const form = event.currentTarget;
  const body = form.elements.body.value.trim();
  const file = form.elements.image.files[0];
  errorNode.textContent = "";
  if (!body && !file) { errorNode.textContent = "写一句话或选一张照片。"; return; }
  button.disabled = true;
  button.textContent = "发布中…";
  const uploaded = [];
  try {
    const imagePath = await uploadFile("images", file, imageTypes, 1024 * 1024);
    if (imagePath) uploaded.push({ bucket: "images", path: imagePath });
    const result = await client.from("comments").insert({
      song_id: songId, user_id: user.id, nickname: profile.nickname, body, image_path: imagePath
    });
    if (result.error) throw result.error;
    form.reset();
    await loadSongs();
    toast("评论已发布。");
  } catch (error) {
    await cleanUploads(uploaded);
    errorNode.textContent = error.message || "评论失败，请稍后再试。";
  } finally { button.disabled = false; button.textContent = "发布评论 ↗"; }
}

$("date").value = selectedDay;
renderWeek();
$("previous-day").addEventListener("click", () => setDay(addDays(selectedDay, -1)));
$("next-day").addEventListener("click", () => setDay(addDays(selectedDay, 1)));
$("date").addEventListener("change", (event) => setDay(event.target.value));
$("search").addEventListener("input", renderSongs);
for (const id of ["open-upload", "open-upload-empty"]) $(id).addEventListener("click", openUpload);
for (const id of ["close-dialog", "cancel-dialog"]) $(id).addEventListener("click", () => $("upload-dialog").close());
$("upload-form").addEventListener("submit", (event) => void publish(event));
document.querySelectorAll('input[name="source"]').forEach((radio) => radio.addEventListener("change", () => {
  const source = document.querySelector('input[name="source"]:checked').value;
  $("file-field").classList.toggle("hidden", source !== "file");
  $("link-field").classList.toggle("hidden", source !== "link");
}));
$("share-site").addEventListener("click", () => void copyLink("./"));
$("share-date").addEventListener("click", () => void copyLink("?day=" + selectedDay));
$("account-button").addEventListener("click", () => user ? openProfile() : openAuth("signin"));
$("show-signup").addEventListener("click", () => switchAuth("signup"));
$("show-signin").addEventListener("click", () => switchAuth("signin"));
$("close-auth").addEventListener("click", () => $("auth-dialog").close());
$("auth-form").addEventListener("submit", (event) => void submitAuth(event));
$("close-profile").addEventListener("click", () => $("profile-dialog").close());
$("profile-form").addEventListener("submit", (event) => void submitProfile(event));
$("sign-out").addEventListener("click", () => void signOut());
if (client) {
  client.auth.onAuthStateChange((_event, session) => {
    user = session?.user || null;
    if (user) setTimeout(() => void hydrateProfile(), 0);
    else { profile = null; updateAccount(); }
  });
  client.auth.getUser().then(async ({ data }) => {
    user = data.user;
    if (user) await hydrateProfile();
    else { updateAccount(); openAuth("signup"); }
  }).catch(() => updateAccount());
}
void loadSongs();
