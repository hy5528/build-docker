/* =========================================================================
 * 红果短剧 Web 版 — 应用逻辑（真实内容版）
 * 数据：/bridge/api/*（真实红果短剧内容，来自 hongguoTV bridge）
 * 播放：/api/prepare → /api/video（服务端解密 + 转码 + 缓存）
 * 全部功能无需登录、无广告、无 VIP 限制
 * ========================================================================= */
'use strict';

/* ---------------- 基础工具 ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- HEVC 能力检测（支持则原画秒开，无需转码） ---------------- */
function supportsHevc() {
  try {
    const v = document.createElement('video');
    return !!(v.canPlayType('video/mp4; codecs="hvc1.1.6.L120.90"') || v.canPlayType('video/mp4; codecs="hev1.1.6.L120.90"'));
  } catch (e) { return false; }
}
const HEVC = supportsHevc();
const RAW_MODE = HEVC ? 'raw' : 'h264';

/* ---------------- API 客户端 ---------------- */
const API = {
  async home(page = 1) { return (await fetch(`/bridge/api/home?page=${page}`)).json(); },
  async search(q, page = 1) { return (await fetch(`/bridge/api/search?q=${encodeURIComponent(q)}&page=${page}`)).json(); },
  async series(id) { return (await fetch(`/bridge/api/series/${encodeURIComponent(id)}`)).json(); },
  async qualities(vid) { return (await fetch(`/api/qualities?vid=${encodeURIComponent(vid)}`)).json(); },
  async rank(type, page = 1) { return (await fetch(`/api/rank?type=${encodeURIComponent(type)}&page=${page}`)).json(); },
  async actor(id) { return (await fetch(`/api/actor?id=${encodeURIComponent(id)}`)).json(); },
  async prepare(vid, q, mode) { return (await fetch(`/api/prepare?vid=${encodeURIComponent(vid)}&q=${q}&mode=${mode || RAW_MODE}`)).json(); },
  async status(vid, q, mode) { return (await fetch(`/api/status?vid=${encodeURIComponent(vid)}&q=${q}&mode=${mode || RAW_MODE}`)).json(); },
};

/* ---------------- 全局状态 ---------------- */
const state = {
  route: 'home', params: {},
  channel: '推荐',
  homeItems: null,          // 真实首页数据
  detailCache: {},          // seriesId -> Series(含 episodes)
  currentSeries: null,
  currentEp: 1,
  quality: '1080p',   // 默认 1080P 原画流式解密（与 hongguoTV 同方案，首帧秒开）
  speed: 1.0,
  danmaku: true,
  autoNext: true,
  episodesOpen: false,
  commentsOpen: false,
};

/* ---------------- 用户数据（本地，无需登录） ---------------- */
const USER = { coins: 12680, history: [], favorites: [], liked: {}, signedDays: 0, lastSign: null };
const LS_KEY = 'hongguo_web_user_v2';
function saveUser() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      coins: USER.coins, history: USER.history, favorites: USER.favorites,
      liked: USER.liked, signedDays: USER.signedDays, lastSign: USER.lastSign,
    }));
  } catch (e) { /* ignore */ }
}
function loadUser() {
  try { const raw = localStorage.getItem(LS_KEY); if (raw) Object.assign(USER, JSON.parse(raw)); } catch (e) { /* ignore */ }
}

/* ---------------- Toast / 金币 ---------------- */
let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}
function goldFly(text) {
  const g = document.createElement('div');
  g.className = 'gold-fly'; g.textContent = text;
  $('#phone').appendChild(g);
  setTimeout(() => g.remove(), 1250);
}
function addCoins(n, reason) {
  USER.coins += n; saveUser();
  if (reason) goldFly(`+${n} 金币`);
}



/* ---------------- 封面 ---------------- */
const PALETTES = [
  ['#7a1f2b', '#c0392b', '#ff6b6b'], ['#12324f', '#1f6f8b', '#38b6ff'],
  ['#3b1d52', '#7b2ff7', '#c084fc'], ['#1d3b2a', '#2e8b57', '#7ef0a8'],
  ['#4f2d12', '#b8772c', '#ffc46b'], ['#2b1d3b', '#5a2ea6', '#a78bfa'],
  ['#123b3b', '#0e8f8f', '#5eead4'], ['#3b1220', '#c2185b', '#ff8fb1'],
];
function hashOf(str) { let h = 0; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
function palette(seed) { return PALETTES[hashOf(seed) % PALETTES.length]; }
function gradient(seed) { const p = palette(seed); return `linear-gradient(155deg, ${p[0]} 0%, ${p[1]} 60%, ${p[2]} 130%)`; }

/* 真实封面卡片 */
function cardHTML(item) {
  const badge = item.badge || '';
  return `
    <div class="card" data-series="${esc(item.id)}">
      <div class="cover" style="background:${gradient(item.id)}">
        ${item.cover ? `<img class="cover-img" src="${esc(item.cover)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ''}
        <span class="ep-tag">${esc(badge || '')}</span>
        ${rankBadgeHTML(item)}
        <div class="cov-title">${esc(item.title)}</div>
      </div>
      <div class="meta">
        <div class="title">${esc(item.title)}</div>
        <div class="sub"><span>${esc((item.tags || '').split('/').slice(0, 2).join(' · '))}</span></div>
      </div>
    </div>`;
}
function coverImgHTML(item, cls = 'cover-sm') {
  const p = palette(item.id);
  return `<div class="${cls}" style="background:linear-gradient(155deg, ${p[0]}, ${p[1]});overflow:hidden">
    ${item.cover ? `<img src="${esc(item.cover)}" style="width:100%;height:100%;object-fit:cover" loading="lazy" onerror="this.style.display='none'">` : ''}
  </div>`;
}

/* ---------------- 播放器生命周期 ---------------- */
let currentVideo = null; // 全局当前播放器（路由切换时强制停止，避免退出后仍有声音）
function stopPlayer() {
  // 无条件卸载页面上所有视频的 src，彻底停止声音
  $$('video').forEach((v) => {
    try {
      v.pause();
      v.removeAttribute('src');
      v.load();
    } catch (e) { /* ignore */ }
  });
  currentVideo = null;
}

/* ---------------- 路由 ---------------- */
function navigate(route, params = {}, push = true) {
  state.route = route; state.params = params || {};
  if (push) location.hash = buildHash(route, params);
  render();
}
function buildHash(route, params) {
  const q = Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return `#/${route}${q ? '?' + q : ''}`;
}
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [route, qs] = h.split('?');
  const params = {};
  if (qs) qs.split('&').forEach((kv) => { const [k, v] = kv.split('='); if (k) params[k] = decodeURIComponent(v || ''); });
  return { route: route || 'home', params };
}

/* ========================================================================
 * 页面渲染
 * ======================================================================== */
function render() {
  stopPlayer();
  if (feedObserver) { feedObserver.disconnect(); feedObserver = null; }
  if (playObserver) { playObserver.disconnect(); playObserver = null; }
  playActiveIndex = -1;
  const { route, params } = state;
  const app = $('#app');
  app.innerHTML = '';
  let page;
  switch (route) {
    case 'home': page = renderHome(); break;
    case 'category': page = renderCategory(); break;
    case 'play': page = renderPlay(params.id, Number(params.ep) || 1); break;
    case 'detail': page = renderDetail(params.id); break;
    case 'search': page = renderSearch(params.q || ''); break;
    case 'actor': page = renderActor(params.id); break;
    case 'rank': page = renderRankPage(params.type || 'hot-drama'); break;
    case 'settings': page = renderSettings(); break;
    case 'downloads': page = renderDownloads(); break;
    case 'teen': page = renderTeen(); break;
    case 'about': page = renderAbout(); break;
    case 'messages': page = renderMessages(); break;
    case 'shelf': page = renderShelf(); break;
    case 'listen': page = renderListen(); break;
    case 'mine': page = renderMine(); break;
    case 'history': page = renderHistory(); break;
    case 'favorites': page = renderFavorites(); break;
    default: page = renderHome();
  }
  page.classList.add('page', 'active', 'animate-in');
  app.appendChild(page);
  renderTabbar(route);
}

function renderTabbar(route) {
  const bar = $('#tabbar');
  if (route === 'play') { bar.innerHTML = ''; bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  const tabs = [
    { id: 'home', name: '首页', icon: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z' },
    { id: 'category', name: '剧场', icon: 'M4 5h16v14H4zM4 9h16M9 5v4' },
    { id: 'listen', name: '听书', icon: 'M12 3a4 4 0 0 1 4 4v5a4 4 0 0 1-8 0V7a4 4 0 0 1 4-4zM5 11a7 7 0 0 0 14 0' },
    { id: 'shelf', name: '书架', icon: 'M5 3h4v18H5zM11 3h4v18h-4zM17 3h2v18h-2z' },
    { id: 'mine', name: '我的', icon: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM4 21a8 8 0 0 1 16 0' },
  ];
  bar.innerHTML = tabs.map((t) => `
    <button class="tab ${route === t.id ? 'active' : ''}" data-nav="${t.id}">
      <span class="tab-ico">
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${t.icon}"/></svg>
      </span>
      ${t.name}
    </button>`).join('');
}

/* ---------------- 榜单（真实数据：热播榜/真人剧榜/漫剧榜/AI剧榜） ---------------- */
const RANK_TYPES = [
  { key: 'hot-drama', name: '热播榜', tag: '热播榜' },
  { key: 'hot-real-drama', name: '真人剧榜', tag: '真人剧榜' },
  { key: 'hot-comic-drama', name: '漫剧榜', tag: '漫剧榜' },
  { key: 'hot-ai-drama', name: 'AI剧榜', tag: 'AI剧榜' },
];
const rankState = { map: {}, loaded: false, loading: false, lists: {} };

let rankLoadingPromise = null;
async function loadRanks(force) {
  if (rankState.loaded && !force) return;
  if (rankLoadingPromise) return rankLoadingPromise;
  rankLoadingPromise = (async () => {
    // 串行请求，避免触发官网频率限制
    for (const t of RANK_TYPES) {
      if (rankState.lists[t.key] && rankState.lists[t.key].length) continue;
      try {
        const data = await API.rank(t.key, 1);
        rankState.lists[t.key] = data.items || [];
        (data.items || []).slice(0, 30).forEach((item, i) => {
          if (item && item.id && !rankState.map[item.id]) {
            rankState.map[item.id] = { type: t.key, name: t.tag, rank: i + 1 };
          }
        });
      } catch (e) { /* 静默，稍后可重试 */ }
    }
    rankState.loaded = true;
  })();
  try { await rankLoadingPromise; } finally { rankLoadingPromise = null; }
  // 刷新当前视图的角标
  if (state.route === 'home' || state.route === 'category') render();
}

function rankTypeFromLabel(label) {
  const s = String(label || '');
  if (s.includes('真人剧')) return 'hot-real-drama';
  if (s.includes('漫剧')) return 'hot-comic-drama';
  if (s.includes('AI剧')) return 'hot-ai-drama';
  return 'hot-drama';
}

function rankBadgeHTML(item) {
  const r = rankState.map[item.id];
  if (!r) return '';
  return `<span class="rank-badge ${r.rank <= 3 ? 'top' : ''}">${r.name}第${r.rank}</span>`;
}

/* ---------------- 首页（竖屏推荐信息流，对应原 App VideoSeriesFeedTab） ---------------- */
const CHANNELS = ['推荐', '电视剧', '电影', '动漫', '综艺', '听书', '漫画', '小说'];
let feedObserver = null;
let feedItems = [];
let feedCurrentIndex = -1;

function renderHome() {
  const page = document.createElement('div');
  page.classList.add('feed-page');
  page.innerHTML = `
    <div class="feed-topbar">
      <div class="searchbox" data-nav="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        搜索短剧
      </div>
      <button class="btn-red" data-nav="history">观看历史</button>
    </div>
    <div class="feed-channels">
      ${CHANNELS.map((c) => `<button class="ch ${state.channel === c ? 'active' : ''}" data-channel="${c}">${c}</button>`).join('')}
    </div>
    <div class="feed" id="feed"><div class="empty-tip">正在加载内容…</div></div>`;
  bindPage(page);
  loadFeed(page);
  loadRanks();
  return page;
}

async function loadFeed(page) {
  const feed = $('#feed', page);
  if (!feed) return;
  try {
    const data = state.homeItems ? { items: state.homeItems } : await API.home(1);
    if (data.error) throw new Error(data.error);
    state.homeItems = data.items || [];
    renderFeedItems(feed);
  } catch (e) {
    feed.innerHTML = '<div class="empty-tip">内容源暂不可用，请稍后重试</div>';
    toast('内容源连接失败');
  }
}

function filteredItems() {
  let items = state.homeItems || [];
  if (state.channel !== '推荐') {
    const ch = state.channel;
    const filtered = items.filter((it) => (it.tags || '').includes(ch) || (it.title || '').includes(ch));
    if (filtered.length) items = filtered;
  }
  return items;
}

function renderFeedItems(feed) {
  feedItems = filteredItems();
  feedCurrentIndex = -1;
  feed.innerHTML = feedItems.map((item, i) => feedCardHTML(item, i)).join('') || '<div class="empty-tip">暂无内容</div>';
  if (feedObserver) { feedObserver.disconnect(); feedObserver = null; }
  feedObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting && en.intersectionRatio > 0.55) {
        activateFeedItem(feed, Number(en.target.dataset.index));
      } else if (en.intersectionRatio < 0.15) {
        pauseFeedItem(en.target);
      }
    });
  }, { root: feed, threshold: [0, 0.15, 0.55, 1] });
  $$('.feed-item', feed).forEach((el) => feedObserver.observe(el));
}

function feedCardHTML(item, i) {
  const tags = (item.tags || '').split('/').filter(Boolean).slice(0, 3);
  return `
  <div class="feed-item" data-index="${i}" data-series="${esc(item.id)}">
    <div class="feed-stage" style="background:${gradient(item.id)}">
      ${item.cover ? `<img class="feed-cover" src="${esc(item.cover)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ''}
      <video class="feed-video" playsinline webkit-playsinline preload="none" loop muted></video>
      <div class="feed-loading"><div class="prep-spinner"></div>
        <div class="feed-loading-text">正在准备视频…</div>
        <div class="prep-bar"><div class="prep-fill"></div></div></div>
      <div class="feed-tapmask" data-act="feedTap"></div>
      ${rankBadgeHTML(item)}
    </div>
    <div class="feed-overlay">
      <div class="feed-actions">
        <button class="feed-act" data-act="feedLike" data-series="${esc(item.id)}">
          <span class="ico"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-7.5-4.7-9.7-9.2C.8 8.6 3 5 6.6 5c2 0 3.7 1.1 5.4 3 1.7-1.9 3.4-3 5.4-3C21 5 23.2 8.6 21.7 11.8 19.5 16.3 12 21 12 21z"/></svg></span><span>点赞</span></button>
        <button class="feed-act" data-act="feedComments" data-series="${esc(item.id)}">
          <span class="ico"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/></svg></span><span>评论</span></button>
        <button class="feed-act" data-act="feedFavorite" data-series="${esc(item.id)}">
          <span class="ico"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg></span><span>收藏</span></button>
        <button class="feed-act" data-act="feedShare" data-series="${esc(item.id)}">
          <span class="ico"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.7 6.8-4M8.6 13.3l6.8 4"/></svg></span><span>分享</span></button>
      </div>
      <div class="feed-info">
        <div class="feed-title">@${esc(item.title)}</div>
        <div class="feed-desc">${esc(item.description || '')}</div>
        <div class="feed-tags">${tags.map((t) => `<span>#${esc(t)}</span>`).join('')}</div>
        <div class="feed-actions-row">
          <button class="feed-btn" data-play="${esc(item.id)}|1">选集 · 共${esc((item.badge || '').replace(/[^0-9]/g, '') || '多')}集</button>
          <button class="feed-btn ghost" data-series="${esc(item.id)}">详情</button>
        </div>
      </div>
      <div class="feed-progress"><div class="feed-progress-fill"></div></div>
      <button class="feed-sound" data-act="feedSound" title="声音">🔇</button>
    </div>
  </div>`;
}

/* 获取某剧第一集的 vid */
async function ensureFirstVid(item) {
  if (item._firstVid) return item._firstVid;
  if (item._vidPromise) return item._vidPromise;
  item._vidPromise = (async () => {
    try {
      const s = await getSeries(item.id);
      item._series = s;
      item._firstVid = (s.episodes && s.episodes[0] && s.episodes[0].id) || null;
      return item._firstVid;
    } catch (e) { return null; }
  })();
  return item._vidPromise;
}

async function activateFeedItem(feed, index) {
  if (feedCurrentIndex === index) return;
  feedCurrentIndex = index;
  const item = feedItems[index];
  const el = feed.querySelector(`.feed-item[data-index="${index}"]`);
  if (!item || !el) return;
  const video = $('video', el);
  const loading = $('.feed-loading', el);
  // 已就绪：直接播放
  if (video.dataset.ready === '1' && video.src) {
    loading.classList.add('hidden');
    playFeedVideo(el);
    preloadFeedItem(index + 1);
    return;
  }
  loading.classList.remove('hidden');
  try {
    const vid = await ensureFirstVid(item);
    if (!vid) throw new Error('视频解析失败');
    const mode = state.quality === 'fast' ? 'official' : RAW_MODE;
    let st = await API.status(vid, state.quality, mode);
    if (st.status !== 'ready') {
      await API.prepare(vid, state.quality, mode);
      for (let i = 0; i < 300; i++) {
        await sleep(1200);
        if (feedCurrentIndex !== index) return; // 已滑走，停止等待
        st = await API.status(vid, state.quality, mode);
        setFeedLoading(el, st);
        if (st.status === 'ready' || st.status === 'error') break;
      }
    }
    if (st.status !== 'ready') throw new Error(st.error || '视频准备失败');
    video.dataset.ready = '1';
    video.src = st.video;
    video.playbackRate = state.speed;
    video.load(); // preload=none 需显式触发加载
    // 加载失败时自动回退（1080P → 720P → 480P）
    video.onerror = () => {
      if (item.dataset.fallback === '1') return;
      item.dataset.fallback = '1';
      const order = ['1080p', '720p', '480p'];
      const idx = order.indexOf(state.quality);
      const next = order[idx + 1];
      if (next) {
        state.quality = next;
        toast(`当前清晰度播放失败，已自动切换到 ${next.toUpperCase()}`);
      }
      item.dataset.ready = '';
      video.removeAttribute('src');
      video.load();
      activateFeedItem(feed, index);
    };
    let failTimer2 = setTimeout(() => {
      if (video.readyState < 2 && feedCurrentIndex === index) { video.onerror && video.onerror(); }
    }, 12000);
    video.onloadeddata = () => {
      clearTimeout(failTimer2);
      loading.classList.add('hidden');
      if (feedCurrentIndex === index) playFeedVideo(el);
    };
    video.ontimeupdate = () => {
      const fill = $('.feed-progress-fill', el);
      if (fill && video.duration) fill.style.width = (video.currentTime / video.duration * 100) + '%';
    };
    video.onended = () => {
      // 播完自动滑到下一个
      const next = feed.querySelector(`.feed-item[data-index="${index + 1}"]`);
      if (next) next.scrollIntoView({ behavior: 'smooth' });
    };
    preloadFeedItem(index + 1);
  } catch (e) {
    loading.classList.remove('hidden');
    $('.feed-loading-text', el).textContent = '加载失败：' + (e.message || '') + '（上滑切换下一个）';
  }
}

function setFeedLoading(el, st) {
  const txt = $('.feed-loading-text', el);
  const fill = $('.feed-loading .prep-fill', el);
  if (fill) fill.style.width = Math.max(2, st.progress || 0) + '%';
  if (txt) {
    if (st.stage === 'download') txt.textContent = `正在解密下载… ${st.progress}%`;
    else if (st.stage === 'transcode') txt.textContent = `正在转码… ${st.progress}%`;
    else if (st.stage === 'resolve') txt.textContent = state.quality === 'fast' ? '正在连接…' : '正在解析视频…';
    else txt.textContent = '正在准备视频…';
  }
}

function pauseFeedItem(el) {
  const v = $('video', el);
  if (v && !v.paused) v.pause();
}

function playFeedVideo(el) {
  const v = $('video', el);
  if (!v || !v.src) return;
  $$('video').forEach((other) => { if (other !== v && !other.paused) other.pause(); });
  v.play().catch(() => {
    // 自动播放被阻止：保持静音重试
    v.muted = true;
    const btn = $('.feed-sound', el);
    if (btn) btn.textContent = '🔇';
    v.play().catch(() => {});
  });
}

async function preloadFeedItem(index) {
  const item = feedItems[index];
  if (!item || item._preloading) return;
  item._preloading = true;
  try {
    const vid = await ensureFirstVid(item);
    if (!vid) return;
    const mode = state.quality === 'fast' ? 'official' : RAW_MODE;
    await API.prepare(vid, state.quality, mode);
  } catch (e) { /* 静默 */ }
}

function setFeedSound(el, on) {
  const v = $('video', el);
  const btn = $('.feed-sound', el);
  if (v) v.muted = !on;
  if (btn) btn.textContent = on ? '🔊' : '🔇';
}

/* ---------------- 剧场（真实榜单 + 分类） ---------------- */
function renderCategory() {
  const page = document.createElement('div');
  const genres = ['全部', '都市', '甜宠', '逆袭', '古装', '悬疑', '战神', '萌宝', '重生', '穿越', '虐恋'];
  const cur = state.params.genre || '全部';
  const rankType = state.params.rank || 'hot-drama';
  const rankName = (RANK_TYPES.find((t) => t.key === rankType) || RANK_TYPES[0]).name;
  page.innerHTML = `
    <div class="topbar"><h3 style="font-size:18px">剧场</h3><div style="flex:1"></div>
      <div class="searchbox" style="flex:none;width:110px" data-nav="search">搜索</div></div>
    <div class="channels" style="top:56px">${genres.map((g) => `<button class="ch ${cur === g ? 'active' : ''}" data-genre="${g}">${g}</button>`).join('')}</div>
    <div class="rank-tabs">${RANK_TYPES.map((r) => `<button class="rank-tab ${rankType === r.key ? 'on' : ''}" data-rank="${r.key}">${r.name}</button>`).join('')}</div>
    <div class="rank-panel" id="rankPanel"><div class="empty-tip">正在加载榜单…</div></div>
    <div class="section-title"><h3>全部短剧</h3><span class="more">共 <b id="catCount">0</b> 部</span></div>
    <div class="grid" id="catGrid" style="padding-top:4px"><div class="empty-tip">正在加载…</div></div>`;
  bindPage(page);
  (async () => {
    const grid = $('#catGrid', page);
    try {
      const items = state.homeItems || (await API.home(1)).items || [];
      state.homeItems = items;
      const list = cur === '全部' ? items : items.filter((it) => (it.tags || '').includes(cur));
      const shown = list.length ? list : items;
      grid.innerHTML = shown.map(cardHTML).join('');
      const cnt = $('#catCount', page); if (cnt) cnt.textContent = shown.length;
    } catch (e) { grid.innerHTML = '<div class="empty-tip">加载失败</div>'; }
    // 真实榜单
    await loadRanks();
    renderRankPanel(page, rankType, rankName);
  })();
  return page;
}

function renderRankPanel(page, rankType, rankName) {
  const panel = $('#rankPanel', page);
  if (!panel) return;
  const list = rankState.lists[rankType] || [];
  if (!list.length) { panel.innerHTML = '<div class="empty-tip">榜单加载失败，请稍后重试</div>'; return; }
  panel.innerHTML = `
    <div class="rank-list" style="padding:0 12px">
      ${list.slice(0, 10).map((s, i) => `
        <div class="rank-item" data-series="${esc(s.id)}">
          <div class="no">${i + 1}</div>
          ${coverImgHTML(s, 'cover-sm')}
          <div style="flex:1;min-width:0">
            <div class="ri-title">${esc(s.title)}</div>
            <div class="ri-sub">${esc((s.tags || '').split('/').slice(0, 2).join(' · '))} · ${esc(s.badge || '')}</div>
          </div>
          <button class="btn-red" data-play="${esc(s.id)}|1">看剧</button>
        </div>`).join('')}
    </div>`;
}

/* ========================================================================
 * 播放页（竖屏滑动切换集数 + 完整播放器控件）
 * ======================================================================== */
let playObserver = null;
let playActiveIndex = -1;

function renderPlay(seriesId, ep) {
  const page = document.createElement('div');
  page.classList.add('play-page');
  page.innerHTML = `
    <div class="play-feed" id="playFeed"><div class="empty-tip" style="padding-top:140px">正在加载剧集…</div></div>
    <div class="ep-panel" id="epPanel">
      <div class="ep-head"><h3 id="epHead">选集</h3><button class="icon-btn" data-act="closeEp" style="color:var(--txt2)">✕</button></div>
      <div class="ep-grid" id="epGrid"></div>
    </div>
    <div class="more-panel" id="morePanel">
      <div class="mp-head"><h3>更多设置</h3><button class="icon-btn" data-act="closeMore" style="color:var(--txt2)">✕</button></div>
      <div class="mp-sec"><div class="mp-label">播放倍速</div>
        <div class="mp-opts" id="speedOpts">${['0.5x', '0.75x', '1.0x', '1.25x', '1.5x', '2.0x'].map((v) => `<button class="mp-opt ${state.speed === parseFloat(v) ? 'on' : ''}" data-speed="${parseFloat(v)}">${v}</button>`).join('')}</div>
      </div>
      <div class="mp-sec"><div class="mp-label">清晰度（原画流式解密，首帧秒开）</div>
        <div class="mp-opts" id="defOpts">${[['1080p', '1080P 原画'], ['720p', '720P'], ['480p', '480P']].map(([v, label]) => `<button class="mp-opt ${state.quality === v ? 'on' : ''}" data-def="${v}">${label}</button>`).join('')}</div>
      </div>
      <div class="mp-sec"><div class="mp-label">播放设置</div>
        <div class="mp-opts">
          <button class="mp-opt ${state.danmaku ? 'on' : ''}" data-toggle="danmaku">弹幕 ${state.danmaku ? '开' : '关'}</button>
          <button class="mp-opt ${state.autoNext ? 'on' : ''}" data-toggle="autoNext">自动连播 ${state.autoNext ? '开' : '关'}</button>
          <button class="mp-opt" data-toggle="clean">清屏</button>
        </div>
      </div>
      <div class="mp-row">
        <button data-act="report">举报</button>
        <button data-act="dislike">不感兴趣</button>
        <button data-act="reloadPlay">重新加载</button>
      </div>
      <div class="mp-row">
        <button data-act="lockScreen">锁屏</button>
        <button data-act="pip">小窗播放</button>
        <button data-act="cast">投屏</button>
        <button data-act="downloadEp">下载本集</button>
      </div>
    </div>`;
  bindPage(page);
  initPlayFeed(page, seriesId, ep);
  return page;
}

function fmtCount(n) {
  n = Number(n) || 0;
  if (!n) return '';
  return n >= 10000 ? (n / 10000).toFixed(1) + '万' : String(n);
}

function playItemHTML(series, episode, index, epCount) {
  const epNo = index + 1;
  const tags = (series.tags || '').split('/').filter(Boolean).slice(0, 3);
  const liked = USER.liked[series.id] ? 'liked' : '';
  const faved = USER.favorites.includes(series.id);
  return `
  <div class="play-item paused" data-ep="${epNo}" data-vid="${esc(episode.id)}" data-index="${index}">
    <div class="play-stage" style="background:${gradient(series.id)}">
      ${series.cover ? `<img class="play-cover" src="${esc(series.cover)}" alt="" onerror="this.style.display='none'">` : ''}
      <video class="play-video" playsinline webkit-playsinline preload="none"></video>
      <div class="play-loading"><div class="prep-spinner"></div>
        <div class="play-loading-text">正在连接…</div>
        <div class="prep-bar"><div class="prep-fill"></div></div></div>
      <div class="play-tapmask" data-act="playTap"></div>
      <button class="play-center" data-act="playToggle" aria-label="播放/暂停">
        <svg class="ico-play" width="58" height="58" viewBox="0 0 24 24" fill="rgba(255,255,255,.9)"><path d="M8 5v14l11-7z"/></svg>
        <svg class="ico-pause" width="58" height="58" viewBox="0 0 24 24" fill="rgba(255,255,255,.9)"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
      </button>
      <button class="play-unlock" data-act="unlock" title="解锁">🔒</button>
    </div>
    <div class="play-ui">
      <div class="play-top">
        <button class="back-btn" data-back="1">‹</button>
        <div class="play-title">${esc(series.title)}</div>
        <div class="play-epno">第${epNo}集/${epCount}</div>
        <button class="icon-btn" data-act="playMore" style="color:#fff">⋯</button>
      </div>
      <div class="play-side">
        <div class="play-avatar">${esc(series.title.slice(0, 1))}</div>
        <button class="play-act ${liked}" data-act="playLike">
          <span class="ico"><svg width="32" height="32" viewBox="0 0 24 24" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-7.5-4.7-9.7-9.2C.8 8.6 3 5 6.6 5c2 0 3.7 1.1 5.4 3 1.7-1.9 3.4-3 5.4-3C21 5 23.2 8.6 21.7 11.8 19.5 16.3 12 21 12 21z"/></svg></span><span>${fmtCount(series.social && series.social.likeCount)}</span></button>
        <button class="play-act" data-act="playComments">
          <span class="ico"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/></svg></span><span>${fmtCount(series.social && series.social.reviewCount) || '评论'}</span></button>
        <button class="play-act ${faved ? 'liked' : ''}" data-act="playFavorite">
          <span class="ico"><svg width="32" height="32" viewBox="0 0 24 24" fill="${faved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.7"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg></span><span>${fmtCount(series.social && series.social.favoriteCount) || '收藏'}</span></button>
        <button class="play-act" data-act="playShare">
          <span class="ico"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.7 6.8-4M8.6 13.3l6.8 4"/></svg></span><span>分享</span></button>
      </div>
      <div class="play-bottom">
        <div class="play-series">@${esc(series.title)}${series.social && series.social.rankLabel ? ` <span class="play-rank" data-rank="${rankTypeFromLabel(series.social.rankLabel)}">${esc(series.social.rankLabel)}</span>` : ''}</div>
        <div class="play-desc">${esc(series.description || '')}</div>
        <div class="play-tags">${tags.map((t) => `<span>#${esc(t)}</span>`).join('')}</div>
        <div class="play-progress-row">
          <span class="play-time">00:00 / 00:00</span>
          <input type="range" class="play-seek" min="0" max="1000" value="0" step="1" aria-label="进度">
          <button class="play-epbtn" data-act="openEpPanel">选集</button>
        </div>
      </div>
    </div>
  </div>`;
}

async function initPlayFeed(page, seriesId, ep) {
  try {
    const series = await getSeries(seriesId);
    state.currentSeries = series;
    state.currentEp = ep;
    const feed = $('#playFeed', page);
    feed.innerHTML = series.episodes.map((e, i) => playItemHTML(series, e, i, series.episodes.length)).join('');
    $('#epHead', page).textContent = `选集（共${series.episodes.length}集）`;
    $('#epGrid', page).innerHTML = series.episodes.map((e, i) => `
      <button class="ep-cell ${i + 1 === ep ? 'cur' : ''}" data-ep="${i + 1}">${i + 1}</button>`).join('');
    // 绑定每个 item 的进度条
    $$('.play-item', feed).forEach((item) => bindPlayItem(page, item));
    // 观察滑动
    if (playObserver) { playObserver.disconnect(); playObserver = null; }
    playObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && en.intersectionRatio > 0.55) {
          activatePlayItem(page, en.target);
        } else if (en.intersectionRatio < 0.15) {
          const v = $('video', en.target);
          if (v && !v.paused) v.pause();
        }
      });
    }, { root: feed, threshold: [0, 0.15, 0.55, 1] });
    $$('.play-item', feed).forEach((el) => playObserver.observe(el));
    // 初始定位到目标集
    const target = feed.querySelector(`.play-item[data-ep="${ep}"]`);
    if (target) target.scrollIntoView();
  } catch (e) {
    const feed = $('#playFeed', page);
    if (feed) feed.innerHTML = `<div class="empty-tip" style="padding-top:140px">加载失败：${esc(e.message || e)}</div>`;
  }
}

function bindPlayItem(page, item) {
  const video = $('video', item);
  const seek = $('.play-seek', item);
  const timeEl = $('.play-time', item);
  let dragging = false;

  seek.addEventListener('input', () => {
    dragging = true;
    item.dataset.dragging = '1';
    const d = video.duration || 0;
    timeEl.textContent = `${fmtClock(seek.value / 1000 * d)} / ${fmtClock(d)}`;
  });
  seek.addEventListener('change', () => {
    const d = video.duration || 0;
    if (!d) { dragging = false; delete item.dataset.dragging; return; }
    const target = seek.value / 1000 * d;
    const wasPlaying = !video.paused;
    video.pause();
    video.muted = true;                 // 静音过渡，避免旧音频残留
    video.currentTime = target;
    const resume = () => {
      video.muted = false;
      if (wasPlaying) video.play().catch(() => {});
      dragging = false;
      delete item.dataset.dragging;
    };
    video.addEventListener('seeked', resume, { once: true });
    setTimeout(() => { if (!video.seeking) resume(); }, 2500);
  });
  // 拖动结束后恢复播放状态标记
  seek.addEventListener('pointerup', () => { dragging = false; delete item.dataset.dragging; });
}

async function activatePlayItem(page, item) {
  const index = Number(item.dataset.index);
  if (playActiveIndex === index && item.dataset.activated === '1') return;
  playActiveIndex = index;
  item.dataset.activated = '1';
  state.currentEp = Number(item.dataset.ep);
  // 暂停其他
  $$('.play-item video', page).forEach((v) => { if (v !== $('video', item) && !v.paused) v.pause(); });
  await loadPlayItemVideo(page, item);
  const v = $('video', item);
  if (v && v.src) v.play().catch(() => {});
  preloadPlayItem(page, index + 1);
  // 更新 URL（replaceState 不触发重渲染）
  try { history.replaceState(null, '', buildHash('play', { id: state.params.id, ep: state.currentEp })); } catch (e) { /* ignore */ }
}

async function loadPlayItemVideo(page, item) {
  const video = $('video', item);
  if (video.dataset.ready === '1' && video.src) return;
  const vid = item.dataset.vid;
  const loading = $('.play-loading', item);
  const loadingText = $('.play-loading-text', item);
  const fill = $('.play-loading .prep-fill', item);
  const q = state.quality;
  const mode = q === 'fast' ? 'official' : RAW_MODE;
  loading.classList.remove('hidden');
  try {
    // 非 HEVC 设备：用缓存文件（可拖动）或流式转码（边转边播，秒开）
    if (mode === 'h264') {
      const st = await API.status(vid, q, 'h264');
      let src;
      if (st.status === 'ready' && st.video) {
        src = st.video;                    // 已缓存：支持 Range/拖动
        loadingText.textContent = '正在连接…';
      } else {
        src = `/api/transcode-stream?vid=${encodeURIComponent(vid)}&q=${encodeURIComponent(q)}`;
        API.prepare(vid, q, 'h264').catch(() => {});   // 后台完整转码，供下次拖动
        loadingText.textContent = '正在边转边播（完整缓存后可拖动进度条）';
      }
      video.dataset.ready = '1';
      // 先绑定事件再设置 src（避免本地缓存加载过快导致回调丢失）
      const onReady = () => {
        loading.classList.add('hidden');
        if (Number(item.dataset.index) === playActiveIndex) video.play().catch(() => {});
      };
      video.onloadeddata = onReady;
      video.oncanplay = onReady;
      video.onerror = () => {
        if (item.dataset.fallback === '1') return;
        item.dataset.fallback = '1';
        // 转码文件异常时重试流式转码
        video.dataset.ready = '';
        video.removeAttribute('src');
        video.load();
        loadPlayItemVideo(page, item).then(() => {
          const vv = $('video', item);
          if (vv && vv.src) vv.play().catch(() => {});
        });
      };
      video.src = src;
      video.playbackRate = state.speed;
      video.load();
      if (video.readyState >= 2) onReady();   // 已缓存：直接触发
      video.onplay = () => item.classList.remove('paused');
      video.onpause = () => item.classList.add('paused');
      video.ontimeupdate = () => {
        if (item.dataset.dragging === '1') return;
        const d = video.duration || 0;
        const seekEl = $('.play-seek', item);
        const timeEl = $('.play-time', item);
        if (seekEl && d) seekEl.value = Math.round(video.currentTime / d * 1000);
        if (timeEl) timeEl.textContent = `${fmtClock(video.currentTime)} / ${fmtClock(d)}`;
      };
      video.onended = () => {
        if (!state.autoNext) return;
        const next = page.querySelector(`.play-item[data-index="${Number(item.dataset.index) + 1}"]`);
        if (next) next.scrollIntoView({ behavior: 'smooth' });
      };
      return;
    }
    // raw 流式（HEVC 设备）：立即就绪，支持 Range 拖动
    let st = await API.status(vid, q, mode);
    if (st.status !== 'ready') {
      await API.prepare(vid, q, mode);
      for (let i = 0; i < 300; i++) {
        await sleep(1200);
        st = await API.status(vid, q, mode);
        fill.style.width = Math.max(2, st.progress || 0) + '%';
        if (st.stage === 'download') loadingText.textContent = `正在解密下载… ${st.progress}%`;
        else if (st.stage === 'transcode') loadingText.textContent = `正在转码… ${st.progress}%`;
        else if (st.stage === 'resolve') loadingText.textContent = '正在解析视频…';
        if (st.status === 'ready' || st.status === 'error') break;
      }
    }
    if (st.status !== 'ready') throw new Error(st.error || '视频准备失败');
    video.dataset.ready = '1';
    // 加载失败时自动回退（1080P → 720P → 480P）
    const fallback = () => {
      if (item.dataset.fallback === '1') return;
      item.dataset.fallback = '1';
      const order = ['1080p', '720p', '480p'];
      const idx = order.indexOf(state.quality);
      const next = order[idx + 1];
      if (next) {
        state.quality = next;
        toast(`当前清晰度播放失败，已自动切换到 ${next.toUpperCase()}`);
      }
      item.dataset.ready = '';
      video.removeAttribute('src');
      video.load();
      loadPlayItemVideo(page, item).then(() => {
        const vv = $('video', item);
        if (vv && vv.src) vv.play().catch(() => {});
      });
    };
    // 先绑定事件再设置 src（避免加载过快导致回调丢失）
    let failTimer = setTimeout(() => {
      if (video.readyState < 2 && Number(item.dataset.index) === playActiveIndex) fallback();
    }, 12000);
    video.onloadeddata = () => {
      clearTimeout(failTimer);
      loading.classList.add('hidden');
      if (Number(item.dataset.index) === playActiveIndex) video.play().catch(() => {});
    };
    video.onerror = fallback;
    video.src = st.video;
    video.playbackRate = state.speed;
    video.load();
    if (video.readyState >= 2) { clearTimeout(failTimer); loading.classList.add('hidden'); video.play().catch(() => {}); }
    video.onplay = () => item.classList.remove('paused');
    video.onpause = () => item.classList.add('paused');
    video.ontimeupdate = () => {
      if (item.dataset.dragging === '1') return;
      const d = video.duration || 0;
      const seekEl = $('.play-seek', item);
      const timeEl = $('.play-time', item);
      if (seekEl && d) seekEl.value = Math.round(video.currentTime / d * 1000);
      if (timeEl) timeEl.textContent = `${fmtClock(video.currentTime)} / ${fmtClock(d)}`;
    };
    video.onended = () => {
      if (!state.autoNext) return;
      const next = page.querySelector(`.play-item[data-index="${Number(item.dataset.index) + 1}"]`);
      if (next) next.scrollIntoView({ behavior: 'smooth' });
      else toast('已是最后一集');
    };
  } catch (e) {
    loadingText.textContent = '加载失败：' + (e.message || '') + '（可上滑切换或重新加载）';
  }
}

async function preloadPlayItem(page, index) {
  const item = page.querySelector(`.play-item[data-index="${index}"]`);
  if (!item || item.dataset.preloading === '1' || item.dataset.ready === '1') return;
  item.dataset.preloading = '1';
  try {
    const q = state.quality;
    const mode = q === 'fast' ? 'official' : RAW_MODE;
    await API.prepare(item.dataset.vid, q, mode);
  } catch (e) { /* 静默 */ }
}

function togglePlayItem(item) {
  const v = $('video', item);
  if (!v || !v.src) return;
  if (v.paused) v.play().catch(() => {}); else v.pause();
}

function fmtClock(sec) {
  sec = Math.floor(sec || 0);
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

/* 详情缓存 */
async function getSeries(id) {
  if (state.detailCache[id]) return state.detailCache[id];
  const data = await API.series(id);
  if (data.error || !data.episodes) throw new Error(data.error || '剧集数据不可用');
  state.detailCache[id] = data;
  return data;
}

/* 历史 */
function recordHistory(series, ep) {
  USER.history = USER.history.filter((h) => h.seriesId !== series.id);
  USER.history.unshift({ seriesId: series.id, ep, title: series.title, cover: series.cover, at: Date.now() });
  USER.history = USER.history.slice(0, 30);
  saveUser();
}

/* ---------------- 详情页 ---------------- */
function renderDetail(seriesId) {
  const page = document.createElement('div');
  page.innerHTML = '<div class="empty-tip" style="padding-top:120px">正在加载…</div>';
  bindPage(page);
  (async () => {
    try {
      const s = await getSeries(seriesId);
      const p = palette(s.id);
      const social = s.social || {};
      const celebrities = s.celebrities || [];
      const tags = (s.tagsArray && s.tagsArray.length) ? s.tagsArray : String(s.tags || '').split('/').filter(Boolean);
      const epStatus = s.episodeInfo ? (s.episodeInfo.series_status === 1 ? '已完结' : '连载中') : '';
      const fmt = (n) => { n = Number(n) || 0; return n >= 10000 ? (n / 10000).toFixed(1) + '万' : String(n); };
      page.innerHTML = `
        <div class="topbar" style="position:absolute;top:0;left:0;right:0;background:transparent;z-index:5">
          <button class="back-btn" data-back="1">‹</button>
        </div>
        <div class="detail-hero">
          <div class="dh-bg" style="background:linear-gradient(155deg, ${p[0]}, ${p[1]})"></div>
          <div class="cover-lg" style="background:linear-gradient(155deg, ${p[0]}, ${p[1]});overflow:hidden">
            ${s.cover ? `<img src="${esc(s.cover)}" style="width:100%;height:100%;object-fit:cover">` : `<div class="cov-title">${esc(s.title)}</div>`}
          </div>
          <div class="dh-info">
            <h2>${esc(s.title)}</h2>
            ${social.rankLabel ? `<div class="dh-rank" data-rank="${rankTypeFromLabel(social.rankLabel)}">🏆 ${esc(social.rankLabel)}</div>` : ''}
            <div class="dh-sub">${esc(s.badge || '')}${epStatus ? ' · ' + epStatus : ''}</div>
            <div class="dh-sub">${esc(tags.slice(0, 3).join(' · '))}</div>
            <div class="dh-score-row">
              ${social.rating != null ? `<span class="dh-score">${social.rating}<small>分</small></span>` : ''}
              ${social.ratingCount ? `<span class="dh-meta">${fmt(social.ratingCount)}人评</span>` : ''}
              ${social.hotText ? `<span class="dh-meta">${esc(social.hotText)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="detail-stats">
          <div><b>${fmt(social.likeCount)}</b><span>点赞</span></div>
          <div><b>${fmt(social.favoriteCount)}</b><span>收藏</span></div>
          <div><b>${fmt(social.reviewCount)}</b><span>评论</span></div>
        </div>
        <div class="detail-actions">
          <button class="play-now" data-play="${esc(s.id)}|1">▶ 立即播放</button>
          <button class="fav-btn ${USER.favorites.includes(s.id) ? 'on' : ''}" data-act="detailFavorite">${USER.favorites.includes(s.id) ? '已收藏' : '＋ 收藏'}</button>
        </div>
        <div class="detail-sec"><h3>简介</h3><p>${esc(s.description || '暂无简介')}</p></div>
        ${celebrities.length ? `
        <div class="detail-sec"><h3>演员阵容</h3>
          <div class="actor-row">
            ${celebrities.map((c) => `
              <div class="actor" data-actor="${esc(c.id)}">
                <div class="a-avatar">${c.avatar ? `<img src="${esc(c.avatar)}" alt="" onerror="this.style.display='none'">` : esc((c.name || '?').slice(0, 1))}</div>
                <div class="a-name">${esc(c.name)}</div>
                <div class="a-role">${esc(c.role || '')}</div>
              </div>`).join('')}
          </div>
        </div>` : ''}
        <div class="detail-sec"><h3>选集（共${s.episodes.length}集）</h3>
          <div class="ep-list">${s.episodes.slice(0, 60).map((e, i) => `<button class="ep-item" data-play="${esc(s.id)}|${i + 1}"><span class="e-name">${i + 1}</span></button>`).join('')}</div>
        </div>
        ${(social.reviews && social.reviews.length) ? `
        <div class="detail-sec"><h3>热评（${fmt(social.reviewCount)}条）</h3>
          ${social.reviews.slice(0, 3).map((r) => `
            <div class="comment">
              <div class="c-avatar" style="overflow:hidden">${r.avatar ? `<img src="${esc(r.avatar)}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` : esc((r.user || '?').slice(0, 1))}</div>
              <div class="c-body"><div class="c-user">${esc(r.user)}</div>
              <div class="c-text">${esc(r.content).slice(0, 140)}</div>
              <div class="c-meta"><span>👍 ${fmt(r.likes)}</span></div></div>
            </div>`).join('')}
        </div>` : ''}
        <div class="detail-sec" style="padding-bottom:90px"><h3>更多短剧</h3>
          <div class="grid" style="padding:0" id="detailMore"></div>
        </div>`;
      bindPage(page);
      const more = $('#detailMore', page);
      if (more && state.homeItems) {
        more.innerHTML = state.homeItems.filter((it) => it.id !== s.id).slice(0, 4).map(cardHTML).join('');
      }
    } catch (e) {
      page.innerHTML = `<div class="empty-tip" style="padding-top:120px">加载失败：${esc(e.message)}</div>`;
    }
  })();
  return page;
}

/* ---------------- 演员主页 ---------------- */
function renderActor(id) {
  const page = document.createElement('div');
  page.innerHTML = '<div class="empty-tip" style="padding-top:120px">正在加载…</div>';
  bindPage(page);
  (async () => {
    try {
      const a = await API.actor(id);
      const fmt = (n) => { n = Number(n) || 0; return n >= 10000 ? (n / 10000).toFixed(1) + '万' : String(n); };
      page.innerHTML = `
        <div class="topbar"><button class="back-btn" data-back="1" style="background:var(--card);color:var(--txt)">‹</button><h3 style="font-size:17px">演员主页</h3></div>
        <div class="actor-head">
          <div class="actor-avatar">${a.avatar ? `<img src="${esc(a.avatar)}" alt="" onerror="this.style.display='none'">` : esc((a.name || '?').slice(0, 1))}</div>
          <div class="actor-info">
            <h2>${esc(a.name)}${a.verified ? ' <span class="verified">✓</span>' : ''}</h2>
            <div class="actor-tags">${(a.subtitles || []).map((t) => `<span>${esc(t)}</span>`).join('')}</div>
            <div class="actor-stats">${fmt(a.fans)} 粉丝 · ${fmt(a.likes)} 获赞</div>
          </div>
        </div>
        ${a.description ? `<div class="actor-bio">${esc(a.description)}</div>` : ''}
        <div class="section-title"><h3>参演作品（${a.works.length}）</h3></div>
        <div class="grid">${a.works.map(cardHTML).join('') || '<div class="empty-tip">暂无作品</div>'}</div>
        <div style="height:90px"></div>`;
      bindPage(page);
    } catch (e) {
      page.innerHTML = `<div class="empty-tip" style="padding-top:120px">加载失败：${esc(e.message)}</div>`;
    }
  })();
  return page;
}

/* ---------------- 榜单页（独立页面） ---------------- */
function renderRankPage(type) {
  const page = document.createElement('div');
  const rankName = (RANK_TYPES.find((t) => t.key === type) || RANK_TYPES[0]).name;
  page.innerHTML = `
    <div class="topbar"><button class="back-btn" data-back="1" style="background:var(--card);color:var(--txt)">‹</button><h3 style="font-size:17px">${rankName}</h3></div>
    <div class="rank-header">基于红果内观看/互动等综合热度排序 · 每日更新</div>
    <div class="rank-tabs">${RANK_TYPES.map((r) => `<button class="rank-tab ${type === r.key ? 'on' : ''}" data-rank="${r.key}">${r.name}</button>`).join('')}</div>
    <div class="rank-panel" id="rankPanel"><div class="empty-tip">正在加载榜单…</div></div>
    <div style="height:90px"></div>`;
  bindPage(page);
  (async () => {
    await loadRanks();
    if (state.route !== 'rank') return;
    const panel = $('#rankPanel', page);
    const list = rankState.lists[type] || [];
    if (!panel) return;
    if (!list.length) {
      // 可能因限流未加载成功，重试一次
      await loadRanks(true);
      if (state.route !== 'rank') return;
    }
    const finalList = rankState.lists[type] || [];
    if (!finalList.length) { panel.innerHTML = '<div class="empty-tip">榜单加载失败，请稍后重试</div>'; return; }
    panel.innerHTML = `
      <div class="rank-list" style="padding:0 12px">
        ${finalList.map((s, i) => `
          <div class="rank-item" data-series="${esc(s.id)}">
            <div class="no">${i + 1}</div>
            ${coverImgHTML(s, 'cover-sm')}
            <div style="flex:1;min-width:0">
              <div class="ri-title">${esc(s.title)}</div>
              <div class="ri-sub">${esc((s.tags || '').split('/').slice(0, 2).join(' · '))} · ${esc(s.badge || '')}</div>
            </div>
            <button class="btn-red" data-play="${esc(s.id)}|1">看剧</button>
          </div>`).join('')}
      </div>`;
  })();
  return page;
}

/* ---------------- 设置页 ---------------- */
function renderSettings() {
  const page = document.createElement('div');
  const s = state.settings = state.settings || { autoNext: true, danmaku: true, quality: state.quality, speed: state.speed, wifiTip: true };
  page.innerHTML = `
    <div class="topbar"><button class="back-btn" data-back="1" style="background:var(--card);color:var(--txt)">‹</button><h3 style="font-size:17px">设置</h3></div>
    <div class="section-title"><h3>播放设置</h3></div>
    <div class="menu-list" style="margin-top:0">
      <div class="menu-item"><span class="mi-ico">⏭️</span>自动连播<span class="mi-value">${s.autoNext ? '已开启' : '已关闭'}</span><button class="switch ${s.autoNext ? 'on' : ''}" data-setting="autoNext"></button></div>
      <div class="menu-item"><span class="mi-ico">💬</span>弹幕默认开关<span class="mi-value">${s.danmaku ? '开启' : '关闭'}</span><button class="switch ${s.danmaku ? 'on' : ''}" data-setting="danmaku"></button></div>
      <div class="menu-item"><span class="mi-ico">🎚️</span>默认倍速<span class="mi-value">${s.speed}x</span><span class="mi-arrow">›</span></div>
      <div class="menu-item"><span class="mi-ico">📶</span>仅 Wi-Fi 下预加载<span class="mi-value">${s.wifiTip ? '开启' : '关闭'}</span><button class="switch ${s.wifiTip ? 'on' : ''}" data-setting="wifiTip"></button></div>
    </div>
    <div class="section-title"><h3>通用</h3></div>
    <div class="menu-list" style="margin-top:0">
      <div class="menu-item" data-act="clearCache"><span class="mi-ico">🧹</span>清空本地记录<span class="mi-arrow">›</span></div>
      <div class="menu-item" data-act="clearApiCache"><span class="mi-ico">🗃️</span>清除接口缓存<span class="mi-arrow">›</span></div>
      <div class="menu-item" data-nav="teen"><span class="mi-ico">🛡️</span>青少年模式<span class="mi-arrow">›</span></div>
      <div class="menu-item" data-nav="about"><span class="mi-ico">ℹ️</span>关于<span class="mi-arrow">›</span></div>
    </div>
    <div style="height:90px"></div>`;
  bindPage(page);
  return page;
}

/* ---------------- 下载管理 ---------------- */
function renderDownloads() {
  const page = document.createElement('div');
  page.innerHTML = `
    <div class="topbar"><button class="back-btn" data-back="1" style="background:var(--card);color:var(--txt)">‹</button><h3 style="font-size:17px">我的下载</h3></div>
    <div id="dlBody"><div class="empty-tip">正在加载…</div></div>`;
  bindPage(page);
  (async () => {
    const body = $('#dlBody', page);
    try {
      const data = await fetch('/api/cache').then((r) => r.json());
      const files = (data.files || []).filter((f) => f.endsWith('.mp4'));
      if (!files.length) { body.innerHTML = '<div class="empty-tip">暂无缓存视频<br><span style="font-size:12px">播放过的视频会自动缓存到本地</span></div>'; return; }
      body.innerHTML = files.map((f) => {
        const m = f.replace('.mp4', '').split('_');
        const vid = m[0]; const q = m[1] || '';
        return `
        <div class="result-item">
          <div class="cover-sm" style="background:var(--card);display:flex;align-items:center;justify-content:center;font-size:18px">🎬</div>
          <div style="flex:1;min-width:0">
            <div class="ri-title">视频 ${esc(vid.slice(-6))}</div>
            <div class="ri-sub">清晰度 ${esc(q.toUpperCase())} · 已缓存</div>
          </div>
          <a class="btn-red" href="/api/video?vid=${encodeURIComponent(vid)}&q=${encodeURIComponent(q)}${q === 'raw' ? '&mode=raw' : ''}" download style="text-decoration:none">下载</a>
        </div>`;
      }).join('');
    } catch (e) { body.innerHTML = '<div class="empty-tip">加载失败</div>'; }
  })();
  return page;
}

/* ---------------- 青少年模式 ---------------- */
function renderTeen() {
  const page = document.createElement('div');
  const on = !!USER.teenMode;
  page.innerHTML = `
    <div class="topbar"><button class="back-btn" data-back="1" style="background:var(--card);color:var(--txt)">‹</button><h3 style="font-size:17px">青少年模式</h3></div>
    <div style="padding:20px 16px;text-align:center">
      <div style="font-size:44px;margin-bottom:12px">🛡️</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px">${on ? '青少年模式已开启' : '开启青少年模式'}</div>
      <div style="font-size:13px;color:var(--txt2);line-height:1.7">
        开启后，每日限看 40 分钟，22:00-6:00 无法使用；<br>仅展示适合青少年的内容，不支持评论与分享。
      </div>
      <button class="btn-red" style="width:100%;height:44px;border-radius:22px;font-size:15px;margin-top:24px" data-act="toggleTeen">${on ? '关闭青少年模式' : '开启青少年模式'}</button>
    </div>
    <div class="menu-list">
      <div class="menu-item"><span class="mi-ico">⏰</span>每日时长限制<span class="mi-value">40 分钟</span></div>
      <div class="menu-item"><span class="mi-ico">🌙</span>禁用时段<span class="mi-value">22:00 - 06:00</span></div>
    </div>`;
  bindPage(page);
  return page;
}

/* ---------------- 关于 ---------------- */
function renderAbout() {
  const page = document.createElement('div');
  page.innerHTML = `
    <div class="topbar"><button class="back-btn" data-back="1" style="background:var(--card);color:var(--txt)">‹</button><h3 style="font-size:17px">关于</h3></div>
    <div style="padding:26px 16px;text-align:center">
      <div style="width:72px;height:72px;border-radius:18px;background:linear-gradient(135deg,#fe2c55,#ff8a5c);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800">果</div>
      <div style="font-size:17px;font-weight:700">红果免费短剧 · Web 版</div>
      <div style="font-size:12px;color:var(--txt2);margin-top:6px">仅供学习交流使用</div>
    </div>
    <div class="menu-list">
      <div class="menu-item"><span class="mi-ico">📱</span>版本<span class="mi-value">Web v2.0</span></div>
      <div class="menu-item"><span class="mi-ico">📄</span>用户协议<span class="mi-arrow">›</span></div>
      <div class="menu-item"><span class="mi-ico">🔒</span>隐私政策<span class="mi-arrow">›</span></div>
      <div class="menu-item"><span class="mi-ico">💬</span>反馈与帮助<span class="mi-arrow">›</span></div>
    </div>
    <div style="padding:20px 16px;font-size:11px;color:var(--txt2);text-align:center;line-height:1.7">
      本应用为学习研究目的的第三方实现，与官方无关。<br>内容来源于公开接口，版权归原平台所有。
    </div>`;
  bindPage(page);
  return page;
}

/* ---------------- 消息中心（演示） ---------------- */
function renderMessages() {
  const page = document.createElement('div');
  const msgs = [
    { icon: '💬', title: '评论与回复', desc: '你发布的评论收到了 3 条新回复', time: '10分钟前' },
    { icon: '❤️', title: '点赞与关注', desc: '你喜欢的剧集更新了新一集', time: '2小时前' },
    { icon: '📢', title: '系统通知', desc: '欢迎使用红果短剧 Web 版', time: '1天前' },
  ];
  page.innerHTML = `
    <div class="topbar"><button class="back-btn" data-back="1" style="background:var(--card);color:var(--txt)">‹</button><h3 style="font-size:17px">消息中心</h3></div>
    <div class="menu-list">
      ${msgs.map((m) => `
        <div class="menu-item">
          <span class="mi-ico">${m.icon}</span>
          <div style="flex:1"><div style="font-size:14px;font-weight:600">${m.title}</div>
          <div style="font-size:12px;color:var(--txt2);margin-top:3px">${m.desc}</div></div>
          <span style="font-size:11px;color:var(--txt2)">${m.time}</span>
        </div>`).join('')}
    </div>`;
  bindPage(page);
  return page;
}

/* ---------------- 搜索 ---------------- */
const SEARCH_HISTORY_KEY = 'hongguo_web_search_history';
function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]'); } catch (e) { return []; }
}
function addSearchHistory(q) {
  if (!q) return;
  let h = getSearchHistory().filter((x) => x !== q);
  h.unshift(q);
  h = h.slice(0, 10);
  try { localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(h)); } catch (e) { /* ignore */ }
}
function renderSearch(q) {
  const page = document.createElement('div');
  const history = getSearchHistory();
  page.innerHTML = `
    <div class="search-top">
      <button class="back-btn" data-back="1" style="background:var(--card);color:var(--txt)">‹</button>
      <div class="search-input-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a9aa2" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input id="searchInput" placeholder="搜索短剧名/类型" value="${esc(q)}">
      </div>
      <button class="btn-red" data-act="doSearch">搜索</button>
    </div>
    <div id="searchBody">
      ${!q ? `
        ${history.length ? `
        <div class="section-title"><h3>搜索历史</h3><span class="more" data-act="clearSearchHistory">清空</span></div>
        <div class="hot-tags">${history.map((h) => `<button class="hot-tag" data-search="${esc(h)}">${esc(h)}</button>`).join('')}</div>` : ''}
        <div class="section-title"><h3>🔥 热门推荐</h3></div>
        <div class="hot-tags">${(state.homeItems || []).slice(0, 9).map((it, i) => `<button class="hot-tag ${i < 3 ? 'hot1' : ''}" data-search="${esc(it.title)}">${i + 1}. ${esc(it.title)}</button>`).join('') || '<div class="empty-tip">正在加载…</div>'}</div>
        <div class="section-title"><h3>猜你想搜</h3></div>
        <div class="hot-tags">${['甜宠', '逆袭', '战神', '重生', '萌宝', '悬疑', '都市', '古装'].map((h) => `<button class="hot-tag" data-search="${h}">${h}</button>`).join('')}</div>`
      : '<div class="empty-tip">搜索中…</div>'}
    </div>`;
  bindPage(page);
  if (q) { addSearchHistory(q); runSearch(page, q); }
  const input = $('#searchInput', page);
  if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(input.value); });
  return page;
}
async function runSearch(page, q) {
  const body = $('#searchBody', page);
  try {
    const data = await API.search(q, 1);
    if (data.error) throw new Error(data.error);
    const items = data.items || [];
    body.innerHTML = `
      <div class="section-title"><h3>找到 ${items.length} 个结果</h3></div>
      ${items.map((s) => `
        <div class="result-item" data-series="${esc(s.id)}">
          ${coverImgHTML(s, 'cover-sm')}
          <div style="flex:1;min-width:0">
            <div class="ri-title">${esc(s.title)}</div>
            <div class="ri-sub">${esc(s.badge || '')} · ${esc((s.tags || '').split('/').slice(0, 3).join(' · '))}</div>
            <div class="ri-desc">${esc(s.description || '')}</div>
          </div>
        </div>`).join('')}
      ${items.length === 0 ? '<div class="empty-tip">没有找到相关短剧</div>' : ''}`;
  } catch (e) {
    body.innerHTML = `<div class="empty-tip">搜索失败：${esc(e.message)}</div>`;
  }
}
function doSearch(q) { if (q && q.trim()) navigate('search', { q: q.trim() }); }

/* ---------------- 福利（本地演示，无广告） ---------------- */

function renderShelf() {
  const page = document.createElement('div');
  const hist = USER.history.slice(0, 3);
  const favs = USER.favorites.map((id) => state.detailCache[id]).filter(Boolean);
  const favIds = USER.favorites;
  page.innerHTML = `
    <div class="topbar"><h3 style="font-size:18px">书架</h3><div style="flex:1"></div>
      <button class="btn-red" data-nav="listen">听书</button></div>
    ${hist.length ? `
    <div class="section-title"><h3>继续观看</h3><span class="more" data-nav="history">全部 ›</span></div>
    <div style="padding:0 12px">
      ${hist.map((h) => `<div class="continue-card" style="margin:0 0 10px" data-play="${esc(h.seriesId)}|${h.ep}">
        ${coverImgHTML({ id: h.seriesId, cover: h.cover }, 'cover-sm')}
        <div class="cc-info"><div class="cc-title">${esc(h.title)}</div><div class="cc-sub">看到第 ${h.ep} 集</div></div>
        <button class="btn-red">继续看</button></div>`).join('')}
    </div>` : ''}
    <div class="section-title"><h3>我的收藏（${favIds.length}）</h3><span class="more" data-nav="favorites">管理 ›</span></div>
    ${favIds.length ? `<div class="grid" style="padding-top:4px" id="favGrid">${favIds.map((id) => {
      const s = state.detailCache[id];
      return s ? cardHTML(s) : `<div class="card" data-series="${esc(id)}"><div class="cover" style="background:${gradient(id)}"><div class="cov-title">加载中…</div></div></div>`;
    }).join('')}</div>` : '<div class="empty-tip">书架还是空的，去首页收藏几部短剧吧</div>'}
    <div style="height:90px"></div>`;
  bindPage(page);
  // 异步补齐收藏卡片信息
  (async () => {
    let changed = false;
    for (const id of favIds) {
      if (!state.detailCache[id]) {
        try { await getSeries(id); changed = true; } catch (e) { /* ignore */ }
      }
    }
    if (changed && state.route === 'shelf') render();
  })();
  return page;
}

/* ---------------- 听书（演示） ---------------- */
function renderListen() {
  const page = document.createElement('div');
  const items = (state.homeItems || []).slice(0, 8);
  page.innerHTML = `
    <div class="topbar"><h3 style="font-size:18px">听书</h3><div style="flex:1"></div>
      <div class="searchbox" style="flex:none;width:110px" data-nav="search">搜索</div></div>
    <div style="padding:0 14px 10px;color:var(--txt2);font-size:12px">热门短剧有声版 · 免费畅听</div>
    ${items.length ? items.map((s) => `
      <div class="listen-item" data-play="${esc(s.id)}|1">
        ${coverImgHTML(s, 'cover-sm')}
        <div style="flex:1;min-width:0">
          <div class="li-title">${esc(s.title)}（有声版）</div>
          <div class="li-sub">${esc(s.badge || '')} · 点击播放视频版</div>
        </div>
        <button class="play-mini">▶</button>
      </div>`).join('') : '<div class="empty-tip">正在加载…</div>'}
    <div style="height:90px"></div>`;
  bindPage(page);
  return page;
}

/* ---------------- 我的 ---------------- */
function renderMine() {
  const page = document.createElement('div');
  page.innerHTML = `
    <div class="mine-head">
      <div class="mine-avatar">果</div>
      <div class="mine-info">
        <div class="m-name">红果用户</div>
        <div class="m-sub">无需登录 · 全功能免费使用</div>
      </div>
    </div>
    <div class="mine-stats">
      <div class="ms"><div class="ms-num">${USER.history.length}</div><div class="ms-label">观看历史</div></div>
      <div class="ms"><div class="ms-num">${USER.favorites.length}</div><div class="ms-label">我的收藏</div></div>
      <div class="ms"><div class="ms-num">${Object.keys(USER.liked).length}</div><div class="ms-label">点赞过</div></div>
    </div>
    <div class="menu-list">
      <div class="menu-item" data-nav="messages"><span class="mi-ico">💬</span>消息中心<span class="mi-value">3 条新消息</span><span class="mi-arrow">›</span></div>
      <div class="menu-item" data-nav="history"><span class="mi-ico">🕘</span>观看历史<span class="mi-value">${USER.history.length} 部</span><span class="mi-arrow">›</span></div>
      <div class="menu-item" data-nav="favorites"><span class="mi-ico">⭐</span>我的收藏<span class="mi-value">${USER.favorites.length} 部</span><span class="mi-arrow">›</span></div>
      <div class="menu-item" data-nav="shelf"><span class="mi-ico">📚</span>我的书架<span class="mi-arrow">›</span></div>
      <div class="menu-item" data-nav="listen"><span class="mi-ico">🎧</span>听书<span class="mi-arrow">›</span></div>
      <div class="menu-item" data-nav="downloads"><span class="mi-ico">⬇️</span>我的下载<span class="mi-arrow">›</span></div>
      <div class="menu-item" data-nav="rank"><span class="mi-ico">🏆</span>榜单<span class="mi-arrow">›</span></div>
      <div class="menu-item" data-nav="settings"><span class="mi-ico">⚙️</span>设置<span class="mi-arrow">›</span></div>
      <div class="menu-item" data-nav="about"><span class="mi-ico">ℹ️</span>关于<span class="mi-value">Web v2.0</span><span class="mi-arrow">›</span></div>
    </div>`;
  bindPage(page);
  return page;
}

/* ---------------- 历史 / 收藏 ---------------- */
function renderHistory() {
  const page = document.createElement('div');
  const items = USER.history;
  page.innerHTML = `
    <div class="topbar"><button class="back-btn" data-back="1" style="background:var(--card);color:var(--txt)">‹</button><h3 style="font-size:17px">观看历史</h3>
      <div style="flex:1"></div>${items.length ? '<button class="btn-red" data-act="clearHistory" style="background:var(--card);color:var(--txt2)">清空</button>' : ''}</div>
    ${items.length ? items.map((h) => `
      <div class="result-item" data-play="${esc(h.seriesId)}|${h.ep}">
        ${coverImgHTML({ id: h.seriesId, cover: h.cover }, 'cover-sm')}
        <div style="flex:1;min-width:0">
          <div class="ri-title">${esc(h.title)}</div>
          <div class="ri-sub">看到第 ${h.ep} 集 · ${new Date(h.at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>`).join('') : '<div class="empty-tip">暂无观看历史</div>'}`;
  bindPage(page);
  return page;
}
function renderFavorites() {
  const page = document.createElement('div');
  const favIds = USER.favorites;
  page.innerHTML = `
    <div class="topbar"><button class="back-btn" data-back="1" style="background:var(--card);color:var(--txt)">‹</button><h3 style="font-size:17px">我的收藏</h3></div>
    ${favIds.length ? `<div class="grid" style="padding-top:10px">${favIds.map((id) => {
      const s = state.detailCache[id];
      return s ? cardHTML(s) : `<div class="card" data-series="${esc(id)}"><div class="cover" style="background:${gradient(id)}"><div class="cov-title">加载中…</div></div></div>`;
    }).join('')}</div>` : '<div class="empty-tip">还没有收藏，去首页逛逛吧</div>'}`;
  bindPage(page);
  (async () => {
    let changed = false;
    for (const id of favIds) {
      if (!state.detailCache[id]) { try { await getSeries(id); changed = true; } catch (e) { /* ignore */ } }
    }
    if (changed && state.route === 'favorites') render();
  })();
  return page;
}

/* ========================================================================
 * 事件绑定
 * ======================================================================== */
function bindPage(page) {
  page.addEventListener('click', (e) => {
    const t = e.target.closest('[data-nav],[data-series],[data-play],[data-channel],[data-genre],[data-rank],[data-actor],[data-setting],[data-search],[data-act],[data-ep],[data-back],[data-task],[data-speed],[data-def],[data-toggle]');
    if (!t) return;
    if (t.dataset.back) return navigate(state.route === 'play' || state.route === 'detail' || state.route === 'history' || state.route === 'favorites' ? 'home' : 'mine');
    if (t.dataset.nav) return navigate(t.dataset.nav);
    if (t.dataset.channel) { state.channel = t.dataset.channel; render(); return; }
    if (t.dataset.genre) { state.params.genre = t.dataset.genre; render(); return; }
    if (t.dataset.rank) {
      if (state.route === 'category') { state.params.rank = t.dataset.rank; render(); }
      else navigate('rank', { type: t.dataset.rank });
      return;
    }
    if (t.dataset.actor) return navigate('actor', { id: t.dataset.actor });
    if (t.dataset.setting) return handleAction('setting', t);
    if (t.dataset.search) return doSearch(t.dataset.search);
    if (t.dataset.act) return handleAction(t.dataset.act, t);
    if (t.dataset.series) return navigate('detail', { id: t.dataset.series });
    if (t.dataset.play) { const [sid, e2] = t.dataset.play.split('|'); return navigate('play', { id: sid, ep: e2 }); }
    if (t.dataset.ep) {
      const ep = Number(t.dataset.ep);
      const feed = $('#playFeed');
      const item = feed && feed.querySelector(`.play-item[data-ep="${ep}"]`);
      if (item) item.scrollIntoView({ behavior: 'smooth' });
      else { state.params.ep = ep; render(); }
      $('#epPanel')?.classList.remove('show');
      $('#sheetMask')?.classList.remove('show');
      return;
    }
    if (t.dataset.speed) {
      state.speed = parseFloat(t.dataset.speed);
      $$('video').forEach((v) => { v.playbackRate = state.speed; });
      $$('#speedOpts .mp-opt').forEach((b) => b.classList.toggle('on', parseFloat(b.dataset.speed) === state.speed));
      return toast(`已切换到 ${state.speed}x 倍速`);
    }
    if (t.dataset.def) {
      state.quality = t.dataset.def;
      $$('#defOpts .mp-opt').forEach((b) => b.classList.toggle('on', b.dataset.def === state.quality));
      toast(state.quality === 'fast' ? '已切换到流畅秒开源' : `已切换到 ${state.quality.toUpperCase()}`);
      $('#morePanel')?.classList.remove('show');
      $('#sheetMask')?.classList.remove('show');
      // 重新加载当前集
      const feed = $('#playFeed');
      const item = feed && feed.querySelector(`.play-item[data-ep="${state.currentEp}"]`);
      if (item) {
        item.dataset.ready = '';
        item.dataset.activated = '';
        const v = $('video', item);
        if (v) { v.removeAttribute('src'); v.load(); }
        const page = $('#app .play-page') || document;
        loadPlayItemVideo(page, item).then(() => { const vv = $('video', item); if (vv && vv.src) vv.play().catch(() => {}); });
      }
      return;
    }
    if (t.dataset.toggle) {
      const k = t.dataset.toggle;
      if (k === 'clean') return toast('清屏：再次点击恢复');
      state[k] = !state[k];
      t.classList.toggle('on', state[k]);
      t.textContent = `${k === 'danmaku' ? '弹幕' : '自动连播'} ${state[k] ? '开' : '关'}`;
      return toast(`${k === 'danmaku' ? '弹幕' : '自动连播'}已${state[k] ? '开启' : '关闭'}`);
    }
    if (t.dataset.act) handleAction(t.dataset.act, t);
  });
}

function handleAction(act, el) {
  const series = state.currentSeries;
  switch (act) {
    case 'feedTap': {
      const item = el.closest('.feed-item');
      const v = $('video', item);
      const now = Date.now();
      if (now - (el._lastTap || 0) < 300) {
        el._lastTap = 0;
        const heart = document.createElement('div');
        heart.className = 'heart-burst';
        heart.textContent = '❤️';
        heart.style.left = 'calc(50% - 30px)';
        heart.style.top = '45%';
        item.appendChild(heart);
        setTimeout(() => heart.remove(), 800);
        const sid = item.dataset.series;
        const s = state.detailCache[sid] || { id: sid };
        toggleLike(s);
        return;
      }
      el._lastTap = now;
      setTimeout(() => {
        if (el._lastTap !== now) return;
        if (v && v.src) { if (v.paused) v.play().catch(() => {}); else v.pause(); }
      }, 300);
      return;
    }
    case 'feedSound': {
      const item = el.closest('.feed-item');
      const v = $('video', item);
      if (v) setFeedSound(item, v.muted);
      return;
    }
    case 'feedLike': {
      const sid = el.dataset.series;
      toggleLike(state.detailCache[sid] || { id: sid });
      return;
    }
    case 'feedFavorite': {
      const sid = el.dataset.series;
      toggleFavorite(state.detailCache[sid] || { id: sid });
      return;
    }
    case 'feedShare': toast('分享链接已复制（模拟）'); return;
    case 'feedComments': {
      const sid = el.dataset.series;
      (async () => {
        try { state.currentSeries = await getSeries(sid); } catch (e) { state.currentSeries = { id: sid }; }
        openComments();
      })();
      return;
    }
    case 'playTap': {
      const item = el.closest('.play-item');
      if (!item) break;
      const now = Date.now();
      if (now - (el._lastTap || 0) < 300) {
        el._lastTap = 0;
        const heart = document.createElement('div');
        heart.className = 'heart-burst';
        heart.textContent = '❤️';
        heart.style.left = 'calc(50% - 30px)';
        heart.style.top = '45%';
        item.appendChild(heart);
        setTimeout(() => heart.remove(), 800);
        toggleLike(state.currentSeries || { id: state.params.id });
        return;
      }
      el._lastTap = now;
      setTimeout(() => {
        if (el._lastTap !== now) return;
        togglePlayItem(item);
      }, 300);
      return;
    }
    case 'playToggle': { const item = el.closest('.play-item'); if (item) togglePlayItem(item); return; }
    case 'openEpPanel': $('#epPanel')?.classList.add('show'); $('#sheetMask')?.classList.add('show'); return;
    case 'playMore': $('#morePanel')?.classList.add('show'); $('#sheetMask')?.classList.add('show'); return;
    case 'playLike': toggleLike(state.currentSeries || { id: state.params.id }); return;
    case 'playComments': openComments(); return;
    case 'playFavorite': toggleFavorite(state.currentSeries || { id: state.params.id }); return;
    case 'playShare': toast('分享链接已复制（模拟）'); return;
    case 'pip': {
      const feed = $('#playFeed');
      const item = feed && feed.querySelector(`.play-item[data-ep="${state.currentEp}"]`);
      const v = item && $('video', item);
      if (v && v.requestPictureInPicture) {
        v.requestPictureInPicture().then(() => toast('已进入小窗播放')).catch((e) => toast('小窗不可用：' + (e.message || '')));
      } else toast('当前浏览器不支持小窗播放');
      return;
    }
    case 'cast': toast('投屏：需在同一局域网且浏览器支持（演示）'); return;
    case 'lockScreen': {
      const feed = $('#playFeed');
      const item = feed && feed.querySelector(`.play-item[data-ep="${state.currentEp}"]`);
      if (item) { item.classList.add('locked'); toast('已锁屏，点击锁定图标解锁'); }
      return;
    }
    case 'unlock': {
      const item = el.closest('.play-item');
      if (item) item.classList.remove('locked');
      return;
    }
    case 'downloadEp': toast('已加入下载队列（演示，可直接用播放器右键保存）'); return;
    case 'reloadPlay': {
      const feed = $('#playFeed');
      const item = feed && feed.querySelector(`.play-item[data-ep="${state.currentEp}"]`);
      if (item) { item.dataset.ready = ''; const v = $('video', item); if (v) { v.removeAttribute('src'); v.load(); } loadPlayItemVideo($('#page-play') || document, item); }
      return;
    }
    case 'togglePlay': { const v = $('#player'); if (v && v.src) { if (v.paused) v.play().catch(() => {}); else v.pause(); } break; }
    case 'episodes': $('#epPanel')?.classList.add('show'); break;
    case 'closeEp': $('#epPanel')?.classList.remove('show'); break;
    case 'comments': openComments(); break;
    case 'closeComments': closeComments(); break;
    case 'sendComment': sendComment(); break;
    case 'like': toggleLike(); break;
    case 'favorite': if (series) toggleFavorite(series); break;
    case 'detailFavorite': if (series) toggleFavorite(series); else { getSeries(state.params.id).then(toggleFavorite).catch(() => {}); } break;
    case 'follow': el.classList.toggle('followed'); el.textContent = el.classList.contains('followed') ? '✓' : '+'; toast(el.classList.contains('followed') ? '已关注' : '已取消关注'); break;
    case 'share': toast('分享链接已复制（模拟）'); break;
    case 'expandDesc': $('#pbDesc')?.classList.toggle('open'); break;
    case 'more': $('#morePanel')?.classList.add('show'); $('#sheetMask')?.classList.add('show'); break;
    case 'closeMore': $('#morePanel')?.classList.remove('show'); $('#sheetMask')?.classList.remove('show'); break;
    case 'report': toast('举报已提交，感谢反馈'); $('#morePanel')?.classList.remove('show'); $('#sheetMask')?.classList.remove('show'); break;
    case 'dislike': toast('将减少类似内容推荐'); $('#morePanel')?.classList.remove('show'); $('#sheetMask')?.classList.remove('show'); break;
    case 'reload': { const feed = $('#playFeed'); const item = feed && feed.querySelector(`.play-item[data-ep="${state.currentEp}"]`); if (item) { item.dataset.ready = ''; const v = $('video', item); if (v) { v.removeAttribute('src'); v.load(); } loadPlayItemVideo($('#app .play-page') || document, item); } break; }
    case 'vip': toast('会员已免费开通（Web 版无广告，无需会员）'); break;
    case 'download': toast('下载管理：可直接用播放器右键保存视频'); break;
    case 'teen': toast('青少年模式：开启后每日限看 40 分钟'); break;
    case 'feedback': toast('反馈与帮助：请在项目仓库提交 Issue'); break;
    case 'withdraw': toast('提现需绑定账号（演示）'); break;
    case 'clearHistory': USER.history = []; saveUser(); render(); toast('已清空观看历史'); break;
    case 'clearCache': { USER.history = []; USER.favorites = []; USER.liked = {}; saveUser(); render(); toast('已清空本地记录'); break; }
    case 'about': toast('红果短剧 Web 版 · 内容来自公开接口'); break;
    case 'doSearch': doSearch($('#searchInput')?.value || ''); break;
    case 'clearSearchHistory': { try { localStorage.removeItem(SEARCH_HISTORY_KEY); } catch (e) { /* ignore */ } render(); toast('已清空搜索历史'); break; }
    case 'clearApiCache': { fetch('/api/cache?clear=1').then(() => toast('接口缓存已清除')).catch(() => toast('清除失败')); break; }
    case 'toggleTeen': { USER.teenMode = !USER.teenMode; saveUser(); render(); toast(USER.teenMode ? '青少年模式已开启' : '已关闭青少年模式'); break; }
    case 'setting': {
      const k = el.dataset.setting;
      state.settings = state.settings || {};
      state.settings[k] = !state.settings[k];
      el.classList.toggle('on', state.settings[k]);
      const item = el.closest('.menu-item');
      const v = item && item.querySelector('.mi-value');
      if (v) v.textContent = state.settings[k] ? '已开启' : '已关闭';
      if (k === 'autoNext') state.autoNext = state.settings[k];
      if (k === 'danmaku') state.danmaku = state.settings[k];
      break;
    }
  }
}

function toggleLike(seriesArg) {
  const series = seriesArg || state.currentSeries;
  if (!series) return;
  const liked = !USER.liked[series.id];
  if (liked) USER.liked[series.id] = true; else delete USER.liked[series.id];
  saveUser();
  const btns = $$(`[data-act="like"],[data-act="feedLike"],[data-act="playLike"]`);
  btns.forEach((btn) => {
    btn.classList.toggle('liked', liked);
    const svg = btn.querySelector('svg'); if (svg) svg.setAttribute('fill', liked ? 'currentColor' : 'none');
  });
  if (!liked) toast('已取消点赞');
}
function toggleFavorite(seriesArg) {
  const series = seriesArg || state.currentSeries;
  if (!series) return;
  const idx = USER.favorites.indexOf(series.id);
  if (idx >= 0) { USER.favorites.splice(idx, 1); toast('已取消收藏'); }
  else { USER.favorites.push(series.id); toast('已加入收藏'); }
  saveUser();
  const on = USER.favorites.includes(series.id);
  $$('[data-act="favorite"],[data-act="playFavorite"]').forEach((btn) => {
    btn.classList.toggle('liked', on);
    const svg = btn.querySelector('svg'); if (svg) svg.setAttribute('fill', on ? 'currentColor' : 'none');
  });
  const fb = $('[data-act="feedFavorite"]');
  if (fb) { fb.classList.toggle('liked', on); const svg = fb.querySelector('svg'); if (svg) svg.setAttribute('fill', on ? 'currentColor' : 'none'); }
  const dbtn = $('[data-act="detailFavorite"]');
  if (dbtn) { dbtn.textContent = on ? '已收藏' : '＋ 收藏'; dbtn.classList.toggle('on', on); }
}

/* 评论（本地生成，无需登录） */
const COMMENT_POOL = [
  ['追剧不睡觉', '这部剧也太上头了吧，一口气看了十几集！'],
  ['一只小柠檬', '男女主颜值演技都在线，剧情反转很多，强烈推荐！'],
  ['月光下的猫', '每天下班就靠这个续命了。'],
  ['山河故人', '女主太飒了，就喜欢这种清醒又独立的人设。'],
  ['甜筒不加糖', '后面的剧情越来越好看，坚持住！'],
  ['风一样的少年', '看完了，后劲很大，已经二刷了。'],
  ['今天也要开心', '这剧的配乐绝了，求BGM名字！'],
  ['摸鱼达人', '上班摸鱼偷看两集，被老板抓包了哈哈哈。'],
];
function commentsFor(seed) {
  const n = 5 + (hashOf(seed) % 4);
  const out = [];
  for (let i = 0; i < n; i++) {
    const [u, c] = COMMENT_POOL[(hashOf(seed) + i * 3) % COMMENT_POOL.length];
    out.push({ id: `c${i}`, user: u, content: c, likes: (hashOf(seed) * 13 + i * 977) % 2400, liked: false, time: `${(i % 3) + 1}天前` });
  }
  return out;
}
function openComments() {
  const series = state.currentSeries;
  const list = $('#commentList');
  if (!series || !list) return;
  // 优先使用真实评论（详情接口返回），否则本地生成
  const real = (series.social && series.social.reviews) || [];
  const fmtTime = (ts) => {
    const n = Number(ts); if (!n) return '';
    const diff = Date.now() / 1000 - n;
    if (diff < 3600) return Math.max(1, Math.round(diff / 60)) + '分钟前';
    if (diff < 86400) return Math.round(diff / 3600) + '小时前';
    if (diff < 86400 * 30) return Math.round(diff / 86400) + '天前';
    return new Date(n * 1000).toLocaleDateString('zh-CN');
  };
  const comments = real.length ? real.map((r, i) => ({
    id: 'real' + i,
    user: r.user,
    avatar: r.avatar,
    content: r.content,
    likes: Number(r.likes) || 0,
    liked: false,
    time: fmtTime(r.time),
  })) : commentsFor(series.id);
  list.innerHTML = comments.map((c) => `
    <div class="comment" data-cid="${c.id}">
      <div class="c-avatar" style="overflow:hidden;background:${palette(c.user || 'x')[1]}">${c.avatar ? `<img src="${esc(c.avatar)}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` : esc((c.user || '?').slice(0, 1))}</div>
      <div class="c-body">
        <div class="c-user">${esc(c.user)}${c.time ? ' · ' + esc(c.time) : ''}</div>
        <div class="c-text">${esc(c.content)}</div>
        <div class="c-meta">
          <span class="c-like ${c.liked ? 'liked' : ''}" data-act="likeComment">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="${c.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 21s-7.5-4.7-9.7-9.2C.8 8.6 3 5 6.6 5c2 0 3.7 1.1 5.4 3 1.7-1.9 3.4-3 5.4-3C21 5 23.2 8.6 21.7 11.8 19.5 16.3 12 21 12 21z"/></svg>
            <span class="n">${c.likes}</span></span>
          <span data-act="replyComment">回复</span>
        </div>
      </div>
    </div>`).join('');
  list.onclick = (e) => {
    const likeEl = e.target.closest('[data-act="likeComment"]');
    if (likeEl) {
      const cid = likeEl.closest('.comment').dataset.cid;
      const c = comments.find((x) => x.id === cid);
      c.liked = !c.liked; c.likes += c.liked ? 1 : -1;
      likeEl.classList.toggle('liked', c.liked);
      likeEl.querySelector('svg').setAttribute('fill', c.liked ? 'currentColor' : 'none');
      likeEl.querySelector('.n').textContent = c.likes;
      return;
    }
    if (e.target.closest('[data-act="replyComment"]')) {
      const input = $('#commentInput'); input.value = '回复：'; input.focus();
    }
  };
  $('#commentSheet').classList.add('show');
  $('#sheetMask').classList.add('show');
}
function closeComments() {
  $('#commentSheet')?.classList.remove('show');
  $('#sheetMask')?.classList.remove('show');
}
function sendComment() {
  const input = $('#commentInput');
  const val = (input?.value || '').trim();
  if (!val) return toast('请输入评论内容');
  const list = $('#commentList');
  const div = document.createElement('div');
  div.className = 'comment';
  div.innerHTML = `
    <div class="c-avatar" style="background:linear-gradient(135deg,#fe2c55,#ff8a5c)">我</div>
    <div class="c-body"><div class="c-user">我 · 刚刚</div><div class="c-text">${esc(val)}</div>
    <div class="c-meta"><span>👍 0</span><span>回复</span></div></div>`;
  list.prepend(div);
  input.value = '';
  toast('评论发布成功');
  
}


document.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-nav]');
  if (nav && !nav.closest('.page')) navigate(nav.dataset.nav);
  if (e.target.id === 'sheetMask') {
    closeComments();
    $('#morePanel')?.classList.remove('show');
    $('#epPanel')?.classList.remove('show');
    $('#sheetMask')?.classList.remove('show');
  }
});
window.addEventListener('hashchange', () => { const { route, params } = parseHash(); state.route = route; state.params = params; render(); });
// 页面进入后台/关闭时暂停所有视频，避免后台残留声音
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    $$('video').forEach((v) => { if (!v.paused) { try { v.pause(); } catch (e) { /* ignore */ } } });
  }
});
window.addEventListener('pagehide', () => {
  $$('video').forEach((v) => { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) { /* ignore */ } });
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeComments();
    $('#epPanel')?.classList.remove('show');
    $('#morePanel')?.classList.remove('show');
    $('#sheetMask')?.classList.remove('show');
  }
  if (e.key === ' ' && state.route === 'play') {
    e.preventDefault();
    const feed = $('#playFeed');
    const item = feed && feed.querySelector(`.play-item[data-ep="${state.currentEp}"]`);
    if (item) togglePlayItem(item);
  }
});

/* ---------------- 启动 ---------------- */
loadUser();
const init = parseHash();
state.route = init.route; state.params = init.params;
render();
