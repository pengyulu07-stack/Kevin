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
let viewMode = params.get("view") === "all" ? "all" : "top";
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
  window.dispatchEvent(new CustomEvent("daytone:day", { detail: { day } }));
  $("date").value = day;
  history.replaceState(null, "", "?space=music&day=" + day + "&view=" + viewMode + location.hash);
  renderWeek();
  void loadSongs();
}
function setView(mode, push = true) {
  viewMode = mode === "all" ? "all" : "top";
  const url = "?space=music&day=" + selectedDay + "&view=" + viewMode + location.hash;
  if (push) history.pushState(null, "", url);
  renderSongs();
  $("today").scrollIntoView({ block: "start" });
}
function renderWeek() {
  const rail = $("week-rail");
  rail.replaceChildren();
  for (let offset = -3; offset <= 3; offset++) {
    const day = addDays(selectedDay, offset);
    const button = el("button", "day-tile" + (offset === 0 ? " selected" : ""));
    button.type = "button";
    button.setAttribute("aria-label", "View " + day + " songs");
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(new Date(day + "T12:00:00Z"));
    button.append(el("small", "", weekday), el("strong", "", day.slice(-2)));
    button.addEventListener("click", () => setDay(day));
    rail.append(button);
  }
}
function updateAccount() {
  $("account-button").textContent = profile ? profile.nickname + " · My account" : (user ? "Set nickname" : "Log in / Sign up");
  renderSongs();
  window.dispatchEvent(new Event("daytone:profile"));
}
function showDialog(id) {
  const dialog = $(id);
  if (!dialog.open) dialog.showModal();
}
function switchAuth(mode) {
  authMode = mode;
  const signup = mode === "signup";
  $("auth-title").textContent = signup ? "Join DAYTONE" : "Welcome back";
  $("nickname-field").classList.toggle("hidden", !signup);
  $("auth-form").elements.nickname.required = signup;
  $("auth-form").elements.password.autocomplete = signup ? "new-password" : "current-password";
  $("show-signup").classList.toggle("selected", signup);
  $("show-signin").classList.toggle("selected", !signup);
  $("submit-auth").textContent = signup ? "Create account ↗" : "Log in ↗";
  $("auth-error").textContent = "";
}
function openAuth(mode = "signup") {
  if (!client) { toast("The shared database is not connected."); return; }
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
  if (!client) { toast("The shared database is not connected."); return false; }
  if (!user) { openAuth("signup"); toast("Set your ID and nickname to join in."); return false; }
  if (!profile) { openProfile(); toast("Save your nickname first."); return false; }
  return true;
}
async function hydrateProfile() {
  if (!client || !user) return;
  const actor = user;
  let result = await client.from("profiles").select("nickname").eq("user_id", actor.id).maybeSingle();
  if (result.error) { toast("Could not load your nickname. Please try again."); return; }
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
  if (!/^\d{6}$/.test(id)) { $("auth-error").textContent = "Enter a six-digit ID."; return; }
  if (password.length < 8) { $("auth-error").textContent = "Password must have at least 8 characters."; return; }
  if (authMode === "signup" && !nickname) { $("auth-error").textContent = "Enter a nickname to sign up."; return; }
  const button = $("submit-auth");
  button.disabled = true;
  $("auth-error").textContent = "";
  try {
    const email = id + "@daytone.invalid";
    const response = authMode === "signup"
      ? await client.auth.signUp({ email, password, options: { data: { nickname } } })
      : await client.auth.signInWithPassword({ email, password });
    if (response.error) throw response.error;
    if (!response.data.session || !response.data.user) throw new Error("Account setup is incomplete. Please contact the site owner.");
    user = response.data.user;
    await hydrateProfile();
    $("auth-dialog").close();
    toast(authMode === "signup" ? "Account created. Keep your six-digit ID and password safe." : "Welcome back.");
    form.elements.password.value = "";
  } catch (error) {
    const message = String(error.message || "");
    $("auth-error").textContent = error.code === "user_already_exists" || /already registered/i.test(message)
      ? "This six-digit ID is taken. Please choose another."
      : /Invalid login credentials/i.test(message) ? "Incorrect ID or password."
      : /invalid email/i.test(message) ? "Numeric ID login is not configured. Please contact the site owner."
      : message || "Could not log in. Please try again.";
  } finally { button.disabled = false; }
}
async function submitProfile(event) {
  event.preventDefault();
  if (!user) { openAuth("signin"); return; }
  const nickname = String($("profile-form").elements.nickname.value).trim();
  if (!nickname || nickname.length > 30) { $("profile-error").textContent = "Nickname must be 1–30 characters."; return; }
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
    toast("Nickname saved.");
  } catch (error) { $("profile-error").textContent = error.message || "Could not save nickname."; }
  finally { button.disabled = false; }
}
async function signOut() {
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) { toast("Could not log out. Please try again."); return; }
  user = null;
  profile = null;
  $("profile-dialog").close();
  updateAccount();
  toast("Logged out.");
}
async function loadSongs() {
  if (!client) { status("Preview: the shared database is not connected."); $("empty").hidden = false; return; }
  const request = ++loadRequest;
  const day = selectedDay;
  status("Loading songs for this date…");
  try {
    const nextSongs = await fetchEveryRow(() => client.from("songs").select("id,owner_id,day,daily_slot,title,artist,nickname,note,audio_path,source_url,cover_path,created_at").eq("day", day).order("created_at", { ascending: false }).order("id"));
    const nextReactions = new Map();
    const nextComments = new Map();
    if (nextSongs.length) {
      for (let start = 0; start < nextSongs.length; start += 50) {
        const ids = nextSongs.slice(start, start + 50).map((song) => song.id);
        const [reactionRows, commentRows] = await Promise.all([
          fetchEveryRow(() => client.from("reactions").select("song_id,user_id,emoji").in("song_id", ids).order("song_id").order("user_id")),
          fetchEveryRow(() => client.from("comments").select("id,song_id,user_id,nickname,body,image_path,created_at").in("song_id", ids).order("created_at", { ascending: true }).order("id"))
        ]);
        for (const row of reactionRows) {
          const list = nextReactions.get(row.song_id) || [];
          list.push(row);
          nextReactions.set(row.song_id, list);
        }
        for (const row of commentRows) {
          const list = nextComments.get(row.song_id) || [];
          list.push(row);
          nextComments.set(row.song_id, list);
        }
      }
    }
    if (request !== loadRequest) return;
    songs = nextSongs;
    reactions = nextReactions;
    comments = nextComments;
    renderSongs();
    status(songs.length ? "Loaded " + day + " songs." : "No songs have been shared this day.");
    window.dispatchEvent(new Event("daytone:songs-loaded"));
  } catch (error) {
    if (request !== loadRequest) return;
    status("Could not load songs: " + (error.message || "please try again"));
    $("empty").hidden = false;
  }
}
async function fetchEveryRow(makeQuery) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const result = await makeQuery().range(offset, offset + 499);
    if (result.error) throw result.error;
    rows.push(...(result.data || []));
    if (!result.data || result.data.length < 500) return rows;
  }
}
function supportCount(song) {
  return (reactions.get(song.id) || []).filter((item) => item.emoji === "👍" || item.emoji === "❤️").length;
}
function renderSongs() {
  const filter = $("search").value.trim().toLocaleLowerCase();
  const ranked = [...songs].sort((a, b) => supportCount(b) - supportCount(a) || b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id));
  const visible = viewMode === "all"
    ? [...songs].filter((song) => (song.title + " " + song.artist + " " + song.nickname).toLocaleLowerCase().includes(filter))
      .sort((a, b) => a.nickname.localeCompare(b.nickname, "zh-CN") || b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id))
    : ranked.slice(0, 5);
  $("feed-title").textContent = viewMode === "all" ? "All songs today" : "Today’s Top 5";
  $("song-count-unit").textContent = viewMode === "all" ? "songs" : "selected";
  $("feed-subtitle").textContent = viewMode === "all" ? "Grouped by contributor" : "Most supported songs today";
  $("feed-search").classList.toggle("hidden", viewMode !== "all");
  $("show-all-songs").classList.toggle("hidden", viewMode === "all");
  $("show-top-songs").classList.toggle("hidden", viewMode !== "all");
  $("song-count").textContent = String(visible.length);
  const list = $("song-list");
  list.replaceChildren();
  $("empty").hidden = visible.length > 0;
  let lastAuthor = null;
  for (const song of visible) {
    if (viewMode === "all" && song.nickname !== lastAuthor) {
      list.append(el("h3", "publisher-heading", "@" + song.nickname));
      lastAuthor = song.nickname;
    }
    list.append(createCard(song, ranked.indexOf(song) + 1));
  }
  if (location.hash.startsWith("#song-") && songs.length && !document.getElementById(location.hash.slice(1)) && viewMode !== "all") {
    setView("all", false);
    return;
  }
  if (location.hash.startsWith("#song-")) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "center" });
}
function publicFile(bucket, path) { return client.storage.from(bucket).getPublicUrl(path).data.publicUrl; }
function createCard(song, rank, discussion = false) {
  const card = el("article", "song-card");
  if (!discussion) card.id = "song-" + song.id;
  card.append(el("div", "song-rank", "#" + rank + " · " + supportCount(song) + " supporters"));
  const art = el("div", "song-art tone-" + (song.title.length % 4) + (song.cover_path ? " has-image" : ""));
  if (song.cover_path) {
    const image = el("img");
    image.src = publicFile("images", song.cover_path);
    image.alt = song.title + " cover";
    image.loading = "lazy";
    art.append(image);
  } else art.append(el("b", "", song.title.slice(0, 2)));
  if (!discussion) {
    art.setAttribute("role", "button"); art.tabIndex = 0;
    art.setAttribute("aria-label", "Open " + song.title + " discussion");
    art.addEventListener("click", () => window.dispatchEvent(new CustomEvent("daytone:open-music-discussion", { detail: { id: song.id } })));
    art.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); art.click(); } });
  }
  card.append(art);
  const meta = el("div", "song-meta");
  meta.append(el("h3", "", song.title));
  meta.append(el("p", "song-byline", (song.artist ? song.artist + " · " : "") + song.nickname));
  if (song.note) meta.append(el("div", "song-note", "“" + song.note + "”"));
  meta.append(el("small", "", song.day + " · " + new Date(song.created_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })));
  const copyName = el("button", "copy-name", "Copy song title");
  copyName.type = "button";
  copyName.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(song.title); toast("Song title copied. Search for it in your own app."); }
    catch { toast("Could not copy automatically. Select the title to copy it."); }
  });
  meta.append(copyName);
  if (song.audio_path) {
    const audio = el("audio", "song-player");
    audio.controls = true;
    audio.preload = "none";
    audio.src = publicFile("tracks", song.audio_path);
    audio.setAttribute("aria-label", "Play " + song.title);
    meta.append(audio);
  } else if (song.source_url) {
    const link = el("a", "open-link", "Listen on the original platform ↗");
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
    button.setAttribute("aria-label", symbol + " " + count + " reactions");
    button.setAttribute("aria-pressed", String(chosen));
    button.append(document.createTextNode(symbol), el("span", "", String(count)));
    button.addEventListener("click", () => void react(song.id, symbol, chosen));
    row.append(button);
  }
  const share = el("button", "share-song", "↗");
  share.type = "button";
  share.setAttribute("aria-label", "Share " + song.title);
  share.addEventListener("click", () => void copyLink("?day=" + song.day + "#song-" + song.id));
  bottom.append(row, share);
  meta.append(bottom);
  const section = el("section", "comment-section");
  const songComments = comments.get(song.id) || [];
  section.append(el("div", "comment-heading", "Comments · " + songComments.length));
  const commentList = el("div", "comment-list");
  if (!songComments.length) commentList.append(el("div", "comment-empty", "No comments yet. Be the first."));
  for (const item of songComments) {
    const entry = el("div", "comment");
    entry.append(el("strong", "", item.nickname), el("time", "", new Date(item.created_at).toLocaleString("en-US", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })));
    if (item.body) entry.append(el("p", "", item.body));
    if (item.image_path) {
      const image = el("img");
      image.src = publicFile("images", item.image_path);
      image.alt = item.nickname + " shared photo";
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
  box.placeholder = "Write a comment, or just share a photo…";
  box.setAttribute("aria-label", "Comment");
  const actions = el("div", "comment-actions");
  const image = el("input");
  image.type = "file";
  image.name = "image";
  image.accept = "image/jpeg,image/png,image/webp,image/gif";
  image.setAttribute("aria-label", "Comment photo; still images up to 15 MB are compressed");
  const submit = el("button", "", "Post comment ↗");
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
  } catch (error) { toast(error.message || "Reaction could not be saved. Please try again."); }
}
async function copyLink(path) {
  const url = new URL(path, location.href).href;
  try { await navigator.clipboard.writeText(url); toast("Link copied. Share it with friends."); }
  catch { toast("Could not copy. Please copy the URL from your browser."); }
}
function openUpload() {
  if (!requireAccount()) return;
  $("form-error").textContent = "";
  showDialog("upload-dialog");
}
async function uploadFile(bucket, file, types, maxBytes) {
  if (!(file instanceof File) || !file.size) return null;
  if (file.size > maxBytes) throw new Error(bucket === "tracks" ? "Audio must be under 8 MB." : "Photo must be under 1 MB.");
  const ext = types[file.type];
  if (!ext) throw new Error(bucket === "tracks" ? "Supported audio: MP3, M4A, OGG, WAV, or WebM." : "Supported images: JPG, PNG, WebP, or GIF.");
  const path = user.id + "/" + crypto.randomUUID() + "." + ext;
  const { error } = await client.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type, cacheControl: "3600" });
  if (error) throw error;
  return path;
}
async function prepareImage(file) {
  if (!(file instanceof File) || !file.size) return file;
  if (!imageTypes[file.type]) throw new Error("Supported images: JPG, PNG, WebP, or GIF.");
  if (file.size <= 1024 * 1024) return file;
  if (file.type === "image/gif") throw new Error("GIFs must be under 1 MB; other photos can be compressed.");
  if (file.size > 15 * 1024 * 1024) throw new Error("Choose a photo under 15 MB.");
  const source = await createImageBitmap(file);
  try {
    let longest = Math.min(Math.max(source.width, source.height), 1800);
    for (let attempt = 0; attempt < 8; attempt++) {
      const scale = longest / Math.max(source.width, source.height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(source.width * scale));
      canvas.height = Math.max(1, Math.round(source.height * scale));
      canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
      const quality = Math.max(0.5, 0.84 - attempt * 0.045);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (!blob) throw new Error("Could not compress photo. Choose another image.");
      if (blob.size <= 1024 * 1024) return new File([blob], "daytone-photo.webp", { type: "image/webp" });
      longest = Math.max(500, Math.round(longest * 0.78));
    }
    throw new Error("This photo could not be compressed below 1 MB. Crop it or choose another.");
  } finally { source.close(); }
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
  if (!title) { errorNode.textContent = "Enter a song title."; return; }
  let sourceUrl = null;
  if (source === "link" && urlText) {
    try {
      const parsed = new URL(urlText);
      if (parsed.protocol !== "https:") throw new Error();
      sourceUrl = parsed.href;
    } catch { errorNode.textContent = "Music links must start with https://."; return; }
  }
  const button = $("submit-song");
  button.disabled = true;
  button.textContent = "Publishing…";
  const uploaded = [];
  try {
    const day = today();
    const usedResult = await client.from("songs").select("daily_slot").eq("owner_id", user.id).eq("day", day);
    if (usedResult.error) throw usedResult.error;
    const used = new Set((usedResult.data || []).map((item) => item.daily_slot));
    if (used.size >= 3) throw new Error("You have shared three songs today. Come back tomorrow.");
    let audioPath = null;
    let coverPath = null;
    if (source === "file") {
      audioPath = await uploadFile("tracks", file, audioTypes, 8 * 1024 * 1024);
      if (audioPath) uploaded.push({ bucket: "tracks", path: audioPath });
    }
    coverPath = await uploadFile("images", await prepareImage(cover), imageTypes, 1024 * 1024);
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
    if (!saved) throw new Error("You have shared three songs today. Come back tomorrow.");
    form.reset();
    $("upload-dialog").close();
    setDay(day);
    toast("Song added to today’s list.");
  } catch (error) {
    await cleanUploads(uploaded);
    errorNode.textContent = error.message || "Could not publish. Please try again.";
  } finally { button.disabled = false; button.textContent = "Publish song ↗"; }
}
async function publishComment(event, songId, errorNode, button) {
  event.preventDefault();
  if (!requireAccount()) return;
  const form = event.currentTarget;
  const body = form.elements.body.value.trim();
  const file = form.elements.image.files[0];
  errorNode.textContent = "";
  if (!body && !file) { errorNode.textContent = "Write a comment or choose a photo."; return; }
  button.disabled = true;
  button.textContent = "Posting…";
  const uploaded = [];
  try {
    const imagePath = await uploadFile("images", await prepareImage(file), imageTypes, 1024 * 1024);
    if (imagePath) uploaded.push({ bucket: "images", path: imagePath });
    const result = await client.from("comments").insert({
      song_id: songId, user_id: user.id, nickname: profile.nickname, body, image_path: imagePath
    });
    if (result.error) throw result.error;
    form.reset();
    await loadSongs();
    toast("Comment posted.");
  } catch (error) {
    await cleanUploads(uploaded);
    errorNode.textContent = error.message || "Could not post comment. Please try again.";
  } finally { button.disabled = false; button.textContent = "Post comment ↗"; }
}

$("date").value = selectedDay;
renderWeek();
$("previous-day").addEventListener("click", () => setDay(addDays(selectedDay, -1)));
$("next-day").addEventListener("click", () => setDay(addDays(selectedDay, 1)));
$("date").addEventListener("change", (event) => setDay(event.target.value));
$("search").addEventListener("input", renderSongs);
$("show-all-songs").addEventListener("click", () => setView("all"));
$("show-top-songs").addEventListener("click", () => setView("top"));
window.addEventListener("popstate", () => {
  const query = new URLSearchParams(location.search);
  if (!((query.get("space") === "music" && query.has("view")) || (!query.has("space") && !query.has("page") && query.has("day")))) return;
  viewMode = query.get("view") === "all" ? "all" : "top";
  const day = validDay(query.get("day")) ? query.get("day") : today();
  if (day !== selectedDay) setDay(day);
  else renderSongs();
});
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
