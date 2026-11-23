/* =========================================================================
 * 红果短剧 Web 版 — 服务端
 *  - 静态文件
 *  - /bridge/*  → 代理 hongguoTV bridge 服务（真实内容：首页/搜索/详情）
 *  - /api/prepare?vid=&q=  启动解密+转码任务（异步，可轮询进度）
 *  - /api/status?vid=&q=   查询任务进度
 *  - /api/video?vid=&q=    播放（转码完成后，支持 Range）
 *  - /api/qualities?vid=   可用清晰度
 *
 * 视频链路：video_model(签名) → CENC 解密(逐段) → ffmpeg H.265→H.264 → 缓存 MP4
 * 内容源来自 N3urda/hongguoTV（GPL-3.0，server/vendor/hongguo.cjs）
 * ========================================================================= */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { createRequire } = require('module');

const ROOT = __dirname;
const VENDOR_DIR = process.env.HONGGUO_VENDOR_DIR || path.join(ROOT, '..', 'hongguoTV', 'server');
const BRIDGE_ORIGIN = process.env.BRIDGE_ORIGIN || 'http://127.0.0.1:8787';
const CACHE_DIR = process.env.VIDEO_CACHE_DIR || path.join(ROOT, '.cache', 'videos');
const PORT = Number(process.env.PORT || 8899);
const TRANSCODE_PRESET = process.env.TRANSCODE_PRESET || 'superfast';
const TRANSCODE_CRF = process.env.TRANSCODE_CRF || '28';

fs.mkdirSync(CACHE_DIR, { recursive: true });
// 启动时清理上次中断遗留的临时文件
for (const f of fs.readdirSync(CACHE_DIR)) {
  if (f.endsWith('.raw') || f.endsWith('.tmp.mp4')) {
    try { fs.unlinkSync(path.join(CACHE_DIR, f)); } catch (e) { /* ignore */ }
  }
}

/* ---------------- 加载红果源（vendor） ---------------- */
const vendorRequire = createRequire(path.join(VENDOR_DIR, 'package.json'));
const axios = vendorRequire('axios');
const vendorSource = fs.readFileSync(path.join(VENDOR_DIR, 'vendor', 'hongguo.cjs'), 'utf8');
const context = vm.createContext({
  require: (name) => {
    if (name === 'node:crypto') return crypto;
    throw new Error('Unsupported module: ' + name);
  },
  Buffer, URL, URLSearchParams, console,
  axios: axios.create({ maxContentLength: 64 * 1024 * 1024, maxBodyLength: 1024 * 1024 }),
});
vm.runInContext(
  vendorSource + '\nthis.api = { requestVideoModel, modelForVideo, resolveStream, prepareHeader, remoteRange, decryptPartial, qualityRows, rankPage, routerData };',
  context,
  { timeout: 5000 }
);
const hg = context.api;

/* ---------------- 官网直连源（明文 H.264，无需解密转码） ---------------- */
const OFFICIAL_ORIGIN = process.env.OFFICIAL_ORIGIN || 'https://hongguoduanju.com';
function officialUrl(vid, quality = '360p') {
  return `${OFFICIAL_ORIGIN}/video/public/${encodeURIComponent(vid)}/${quality}.mp4`;
}

/* ---------------- 流式转码（边转边播，首帧秒开；同时后台缓存完整文件供下次 seek） ---------------- */
function streamTranscode(req, res, vid, quality) {
  const streamUrl = `${BRIDGE_ORIGIN}/api/episodes/${encodeURIComponent(vid)}/stream`;
  const ff = spawn('ffmpeg', [
    '-v', 'error',
    '-i', streamUrl,
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '26',
    '-c:a', 'aac', '-b:a', '64k',
    '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
    '-f', 'mp4', 'pipe:1',
  ]);
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  });
  ff.stdout.pipe(res);
  ff.stderr.on('data', () => { /* ignore */ });
  ff.on('error', () => { try { res.end(); } catch (e) { /* ignore */ } });
  ff.on('close', () => { try { res.end(); } catch (e) { /* ignore */ } });
  req.on('close', () => { try { ff.kill('SIGKILL'); } catch (e) { /* ignore */ } });
  // 后台完整转码并缓存（下次播放可拖动进度条）
  prepare(vid, quality, 'h264').catch(() => { /* ignore */ });
}

/* ---------------- 媒体代理（Range 透传，域名白名单） ---------------- */
const MEDIA_HOSTS = ['hongguoduanju.com', 'qznovelvod.com', 'snssdk.com', 'byteimg.com', 'fqnovelpic.com'];
function proxyMedia(req, res, target) {
  const mod = target.protocol === 'http:' ? require('http') : require('https');
  const headers = { 'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0', 'Accept': '*/*' };
  if (req.headers.range) headers.Range = req.headers.range;
  if (req.headers.referer) headers.Referer = req.headers.referer;
  const upstream = mod.request({
    hostname: target.hostname, port: target.port || (target.protocol === 'http:' ? 80 : 443),
    path: target.pathname + target.search, method: req.method, headers, timeout: 30000,
  }, (up) => {
    const out = { ...up.headers, 'Access-Control-Allow-Origin': '*' };
    res.writeHead(up.statusCode, out);
    up.pipe(res);
  });
  upstream.on('timeout', () => { upstream.destroy(); });
  upstream.on('error', (e) => { try { res.writeHead(502); res.end('media error: ' + e.message); } catch (err) { /* ignore */ } });
  upstream.end();
}

/* 官网源预检查（仅用于 /api/official 探测，非播放主链路） */
async function checkOfficial(url) {
  try {
    const resp = await axios.get(url, {
      timeout: 6000, responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', Range: 'bytes=0-1023' },
      maxContentLength: 1024 * 1024,
    });
    return resp.status === 200 || resp.status === 206;
  } catch (e) { return false; }
}

/* ---------------- bridge 流式解密代理（raw 模式：Range 按需解密，秒开） ---------------- */
function proxyBridgeStream(req, res, streamUrl) {
  const target = new URL(streamUrl);
  const headers = { 'Accept': 'video/mp4,*/*', 'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0' };
  if (req.headers.range) headers.Range = req.headers.range;
  const upstream = http.request({
    hostname: target.hostname, port: target.port || 80,
    path: target.pathname + target.search, method: req.method, headers, timeout: 60000,
  }, (up) => {
    const out = { ...up.headers, 'Access-Control-Allow-Origin': '*' };
    delete out['cache-control'];
    res.writeHead(up.statusCode, out);
    up.pipe(res);
  });
  upstream.on('timeout', () => { upstream.destroy(); });
  upstream.on('error', (e) => { try { res.writeHead(502); res.end('stream error: ' + e.message); } catch (err) { /* ignore */ } });
  req.on('close', () => { try { upstream.destroy(); } catch (e) { /* ignore */ } });
  upstream.end();
}

/* ---------------- 转码任务管理 ---------------- */
const tasks = new Map(); // key -> { status, progress, file, error, stage }

function taskKey(vid, q) { return `${vid}_${q}`; }

function getTask(vid, q, mode = 'h264') {
  return getTaskByKey(taskKey(vid, q) + '_' + mode, path.join(CACHE_DIR, `${taskKey(vid, q)}_${mode}.mp4`));
}

function getTaskByKey(key, file) {
  const t = tasks.get(key);
  if (t) return t; // 任务进行中/已完成/失败，均以任务状态为准
  if (fs.existsSync(file) && fs.statSync(file).size > 1024) {
    return { status: 'ready', progress: 100, file, error: null, stage: 'ready', cached: true };
  }
  return null;
}

function videoUrlFor(vid, q, task) {
  if (task && task.officialUrl) return `/api/media?u=${encodeURIComponent(task.officialUrl)}`;
  const mode = task && task.mode ? task.mode : 'h264';
  return `/api/video?vid=${encodeURIComponent(vid)}&q=${encodeURIComponent(q)}&mode=${encodeURIComponent(mode)}`;
}

async function runTranscode(vid, quality, task, duration) {
  // 1) 解析 + 建索引
  task.stage = 'resolve';
  const stream = await hg.resolveStream(vid, quality);
  const prepared = await hg.prepareHeader(stream);
  const total = prepared.total;

  // 2) 逐段解密下载
  task.stage = 'download';
  const rawFile = task.file + '.raw';
  const out = fs.createWriteStream(rawFile);
  const CHUNK = 1024 * 1024;
  const downloadWeight = task.mode === 'raw' ? 100 : 35;
  for (let start = 0; start < total; start += CHUNK) {
    const end = Math.min(start + CHUNK - 1, total - 1);
    const part = hg.decryptPartial((await hg.remoteRange(stream, start, end)).data, start, stream.key, prepared);
    if (!out.write(part)) await new Promise((r) => out.once('drain', r));
    task.progress = Math.min(downloadWeight, Math.round(((start + CHUNK) / total) * downloadWeight));
  }
  await new Promise((r) => out.end(r));

  // 3a) raw 模式：解密后的 H.265（hvc1）直接缓存，无需转码（浏览器 HEVC 硬解可直放）
  if (task.mode === 'raw') {
    fs.renameSync(rawFile, task.file);
    task.status = 'ready';
    task.progress = 100;
    task.stage = 'ready';
    return;
  }

  // 3b) h264 模式：转码（兼容不支持 HEVC 的浏览器）
  task.stage = 'transcode';
  const tmpFile = task.file + '.tmp.mp4';
  await transcode(rawFile, tmpFile, duration, (p) => { task.progress = 35 + Math.round(p * 65); });
  fs.renameSync(tmpFile, task.file);
  try { fs.unlinkSync(rawFile); } catch (e) { /* ignore */ }
  task.status = 'ready';
  task.progress = 100;
  task.stage = 'ready';
}

function transcode(input, output, duration, onProgress) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-y', '-v', 'error',
      '-i', input,
      '-c:v', 'libx264', '-preset', TRANSCODE_PRESET, '-crf', TRANSCODE_CRF,
      '-c:a', 'aac', '-b:a', '64k',
      '-af', 'aresample=async=1:first_pts=0',   // 音频缺口补偿，保证音画同步
      '-movflags', '+faststart',
      '-progress', 'pipe:1',
      output,
    ]);
    let buf = '';
    ff.stdout.on('data', (d) => {
      buf += d.toString();
      let idx;
      while ((idx = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, idx).trim(); buf = buf.slice(idx + 1);
        const eq = line.indexOf('=');
        if (eq < 0) continue;
        const k = line.slice(0, eq), v = line.slice(eq + 1);
        if (k === 'out_time_ms' && duration) onProgress(Math.max(0, Math.min(1, Number(v) / 1e6 / duration)));
        if (k === 'progress' && v === 'end') onProgress(1);
      }
    });
    ff.stderr.on('data', (d) => { /* ffmpeg errors only */ });
    ff.on('error', reject);
    ff.on('close', (code) => code === 0 ? resolve() : reject(new Error('ffmpeg exit ' + code)));
  });
}

async function prepare(vid, quality, mode = 'h264') {
  const key = taskKey(vid, quality) + '_' + mode;
  // 「fast」= 官网明文源直连（秒开，无需解密转码）
  if (quality === 'fast') {
    const fastKey = taskKey(vid, 'fast');
    const t = tasks.get(fastKey);
    if (t) return t;
    // 不做预检查（官网 HEAD 响应慢），直接返回官网源；
    // 若官网无此剧集，前端会在播放报错后自动回退到原画/转码
    const task = {
      status: 'ready', progress: 100, stage: 'ready', mode: 'official',
      file: null, error: null, official: true,
      officialUrl: officialUrl(vid, '360p'),
    };
    tasks.set(fastKey, task);
    return task;
  }
  // 「raw」= 流式解密（代理 bridge，Range 按需解密，首帧秒开，不落盘不转码）
  if (mode === 'raw') {
    const rawKey = taskKey(vid, quality) + '_raw';
    const t = tasks.get(rawKey);
    if (t) return t;
    const task = {
      status: 'ready', progress: 100, stage: 'ready', mode: 'raw',
      file: null, error: null,
      streamUrl: `${BRIDGE_ORIGIN}/api/episodes/${encodeURIComponent(vid)}/stream`,
    };
    tasks.set(rawKey, task);
    return task;
  }
  const file = path.join(CACHE_DIR, `${key}.mp4`);
  const existing = getTaskByKey(key, file);
  if (existing && existing.status === 'ready') return existing;
  if (existing && existing.status === 'processing') return existing;
  tasks.delete(key);

  const task = {
    status: 'processing', progress: 0, stage: 'init', mode,
    file, error: null, startedAt: Date.now(),
  };
  tasks.set(key, task);
  (async () => {
    try {
      const raw = await hg.requestVideoModel(vid);
      const model = hg.modelForVideo(raw, vid);
      const duration = Number(model.video_duration) || 0;
      await runTranscode(vid, quality, task, duration);
    } catch (e) {
      task.status = 'error';
      task.error = String((e && e.message) || e);
      console.error('[transcode]', key, task.error);
    }
  })();
  return task;
}

/* ---------------- 清晰度列表 ---------------- */
async function qualities(vid) {
  const raw = await hg.requestVideoModel(vid);
  const model = hg.modelForVideo(raw, vid);
  const rows = hg.qualityRows(model.video_list);
  const withCodec = rows.map((r) => ({
    key: String(r.quality || r.key).toLowerCase().replace(/p$/, '') + 'p',
    label: r.quality || r.key,
    height: r.item?.video_meta?.vheight || 0,
    size: r.item?.video_meta?.size || 0,
    codec: r.item?.video_meta?.codec_type || '',
  }));
  // bytevc2 无法解密播放，优先只暴露 bytevc1
  const compatible = withCodec.filter((q) => q.codec.toLowerCase() === 'bytevc1');
  return {
    duration: Number(model.video_duration) || 0,
    expire: model.url_expire,
    items: compatible.length ? compatible : withCodec,
  };
}

/* ---------------- HTTP 工具 ---------------- */
function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(body);
}

function serveFile(req, res, file, contentType) {
  let stat;
  try { stat = fs.statSync(file); } catch (e) { res.writeHead(404); return res.end('not found'); }
  const range = req.headers.range;
  const type = contentType || 'video/mp4';
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let start = m && m[1] ? Number(m[1]) : 0;
    let end = m && m[2] ? Number(m[2]) : stat.size - 1;
    if (!Number.isFinite(start) || start < 0) start = 0;
    if (!Number.isFinite(end) || end >= stat.size) end = stat.size - 1;
    if (start > end) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }); return res.end(); }
    res.writeHead(206, {
      'Content-Type': type,
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Content-Length': end - start + 1,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, {
    'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=3600', 'Access-Control-Allow-Origin': '*',
  });
  fs.createReadStream(file).pipe(res);
}

/* ---------------- 静态文件 & 代理 ---------------- */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

function serveStatic(req, res) {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(ROOT, path.normalize(p));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404');
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

/* ---------------- 接口内存缓存（home/series/search） ---------------- */
const httpCache = new Map(); // path -> { time, ttl, body }
const CACHE_RULES = [
  [/^\/api\/series\//, 30 * 60 * 1000],  // 剧集详情：30 分钟（集数列表很少变）
  [/^\/api\/actor/, 30 * 60 * 1000],     // 演员页：30 分钟
  [/^\/api\/home/, 2 * 60 * 1000],        // 首页推荐：2 分钟
  [/^\/api\/search/, 60 * 1000],          // 搜索结果：1 分钟
  [/^\/api\/rank/, 5 * 60 * 1000],        // 榜单：5 分钟
];
function cacheTtlFor(path) {
  for (const [re, ttl] of CACHE_RULES) if (re.test(path)) return ttl;
  return 0;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of httpCache) if (now - v.time > v.ttl) httpCache.delete(k);
  while (httpCache.size > 300) httpCache.delete(httpCache.keys().next().value);
}, 60000).unref();

function proxyBridge(req, res) {
  const target = new URL(BRIDGE_ORIGIN);
  const path = req.url.replace(/^\/bridge/, '') || '/';
  const ttl = req.method === 'GET' ? cacheTtlFor(path) : 0;
  if (ttl) {
    const hit = httpCache.get(path);
    if (hit && Date.now() - hit.time < hit.ttl) {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Cache': 'HIT', 'X-Cache-Age': String(Math.round((Date.now() - hit.time) / 1000)),
        'Access-Control-Allow-Origin': '*',
      });
      return res.end(hit.body);
    }
  }
  const opts = {
    hostname: target.hostname, port: target.port || 80, method: req.method,
    path, headers: { ...req.headers, host: target.host },
  };
  const upstream = http.request(opts, (up) => {
    if (ttl && up.statusCode === 200) {
      const chunks = [];
      up.on('data', (c) => chunks.push(c));
      up.on('end', () => {
        const body = Buffer.concat(chunks);
        httpCache.set(path, { time: Date.now(), ttl, body });
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Cache': 'MISS', 'Access-Control-Allow-Origin': '*',
        });
        res.end(body);
      });
    } else {
      res.writeHead(up.statusCode, { ...up.headers, 'X-Cache': 'BYPASS', 'Access-Control-Allow-Origin': '*' });
      up.pipe(res);
    }
  });
  upstream.on('error', (e) => sendJson(res, 502, { error: 'bridge 服务不可用: ' + e.message }));
  req.pipe(upstream);
}

/* ---------------- 路由 ---------------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;
  try {
    if (p.startsWith('/bridge/')) return proxyBridge(req, res);

    if (p === '/api/prepare') {
      const vid = url.searchParams.get('vid');
      const q = url.searchParams.get('q') || 'fast';
      const mode = url.searchParams.get('mode') || 'h264';
      if (!vid) return sendJson(res, 400, { error: '缺少 vid' });
      const task = await prepare(vid, q, mode);
      return sendJson(res, 200, {
        status: task.status, progress: task.progress, stage: task.stage,
        error: task.error, cached: !!task.cached, mode: task.mode || mode,
        video: task.status === 'ready' ? videoUrlFor(vid, q, task) : null,
      });
    }

    if (p === '/api/status') {
      const vid = url.searchParams.get('vid');
      const q = url.searchParams.get('q') || 'fast';
      const mode = url.searchParams.get('mode') || 'h264';
      const task = q === 'fast' ? (tasks.get(taskKey(vid, 'fast')) || null) : getTask(vid, q, mode);
      if (!task) return sendJson(res, 200, { status: 'idle', progress: 0 });
      return sendJson(res, 200, {
        status: task.status, progress: task.progress, stage: task.stage, error: task.error,
        mode: task.mode || mode,
        video: task.status === 'ready' ? videoUrlFor(vid, q, task) : null,
      });
    }

const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));

    if (p === '/api/rank') {
      const type = url.searchParams.get('type') || 'hot-drama';
      const pageNo = Number(url.searchParams.get('page') || 1) || 1;
      const cacheKey = `/api/rank?type=${type}&page=${pageNo}`;
      const hit = httpCache.get(cacheKey);
      if (hit && Date.now() - hit.time < hit.ttl) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'HIT', 'Access-Control-Allow-Origin': '*' });
        return res.end(hit.body);
      }
      // 官网有频率限制：失败重试（指数退避）
      let data = null, lastErr = null;
      for (let i = 0; i < 3; i++) {
        try { data = await hg.rankPage(type, pageNo); break; }
        catch (e) { lastErr = e; await sleepMs(500 * (i + 1)); }
      }
      if (!data) return sendJson(res, 502, { error: String((lastErr && lastErr.message) || lastErr) });
      // 榜单源为 TVBox 格式（url/title/img/tname），转换为统一卡片格式
      const items = (data.list || []).map((row) => ({
        id: String(row.url || ''),
        title: row.title || '',
        cover: row.img || '',
        description: row.content || '',
        badge: row.desc || '',
        tags: row.tname || '',
      })).filter((it) => it.id && it.title);
      const body = Buffer.from(JSON.stringify({ type, page: pageNo, items, pagination: data.pagination }));
      httpCache.set(cacheKey, { time: Date.now(), ttl: 5 * 60 * 1000, body });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'MISS', 'Access-Control-Allow-Origin': '*' });
      return res.end(body);
    }

    if (p === '/api/actor') {
      const id = url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { error: '缺少 id' });
      const cacheKey = `/api/actor?id=${id}`;
      const hit = httpCache.get(cacheKey);
      if (hit && Date.now() - hit.time < hit.ttl) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'HIT', 'Access-Control-Allow-Origin': '*' });
        return res.end(hit.body);
      }
      // 官网演员页：/character/<celebrity_id>
      const data = await hg.routerData(`https://hongguoduanju.com/character/${encodeURIComponent(id)}`);
      const pageData = (data && data.loaderData && data.loaderData['character_(id)/page']) || {};
      const u = pageData.userInfo || {};
      const result = {
        id,
        name: u.user_name || '',
        avatar: u.user_avatar || '',
        description: u.description || '',
        subtitles: u.subtitle_list || [],
        fans: (u.user_relation_info && u.user_relation_info.fans_num) || 0,
        likes: (u.user_relation_info && u.user_relation_info.digged_count) || 0,
        verified: !!u.is_blue_vip,
        works: (pageData.videoList || []).map((v) => ({
          id: String(v.series_id),
          title: v.series_title || '',
          cover: v.series_cover || '',
          badge: v.episode_right_text || '',
          description: v.series_intro || '',
          tags: (v.category_list || []).map((c) => c.name).filter(Boolean).join('/'),
          hot: (v.hot_score_data && v.hot_score_data.text) || '',
          status: v.series_status,
        })),
      };
      const body = Buffer.from(JSON.stringify(result));
      httpCache.set(cacheKey, { time: Date.now(), ttl: 30 * 60 * 1000, body });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'MISS', 'Access-Control-Allow-Origin': '*' });
      return res.end(body);
    }

    if (p === '/api/transcode-stream') {
      const vid = url.searchParams.get('vid');
      const q = url.searchParams.get('q') || '720p';
      if (!vid) return sendJson(res, 400, { error: '缺少 vid' });
      // 已缓存则直接返回文件（支持 Range/seek）
      const cached = getTask(vid, q, 'h264');
      if (cached && cached.status === 'ready' && cached.file) return serveFile(req, res, cached.file);
      return streamTranscode(req, res, vid, q);
    }

    if (p === '/api/media') {
      const u = url.searchParams.get('u');
      if (!u) return sendJson(res, 400, { error: '缺少 u' });
      let target;
      try { target = new URL(u); } catch (e) { return sendJson(res, 400, { error: '非法地址' }); }
      if (!MEDIA_HOSTS.some((h) => target.hostname === h || target.hostname.endsWith('.' + h))) {
        return sendJson(res, 403, { error: '域名不在白名单' });
      }
      return proxyMedia(req, res, target);
    }

    if (p === '/api/video') {
      const vid = url.searchParams.get('vid');
      const q = url.searchParams.get('q') || 'fast';
      const mode = url.searchParams.get('mode') || 'h264';
      const task = q === 'fast' ? (tasks.get(taskKey(vid, 'fast')) || null) : getTask(vid, q, mode);
      if (!task || task.status !== 'ready') return sendJson(res, 404, { error: '尚未准备好' });
      if (task.streamUrl) return proxyBridgeStream(req, res, task.streamUrl);
      if (task.officialUrl) {
        const target = new URL(task.officialUrl);
        return proxyMedia(req, res, target);
      }
      return serveFile(req, res, task.file);
    }

    if (p === '/api/qualities') {
      const vid = url.searchParams.get('vid');
      if (!vid) return sendJson(res, 400, { error: '缺少 vid' });
      return sendJson(res, 200, await qualities(vid));
    }

    if (p === '/api/cache') {
      if (url.searchParams.get('clear') === '1') {
        httpCache.clear();
        return sendJson(res, 200, { cleared: true });
      }
      const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith('.mp4'));
      return sendJson(res, 200, {
        count: files.length, files,
        interface_cache: [...httpCache.entries()].map(([k, v]) => ({ path: k, age_s: Math.round((Date.now() - v.time) / 1000), ttl_s: Math.round(v.ttl / 1000) })),
      });
    }

    return serveStatic(req, res);
  } catch (e) {
    console.error('[server]', p, String(e && e.message || e));
    sendJson(res, 500, { error: String((e && e.message) || e) });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`红果短剧 Web 版：http://127.0.0.1:${PORT}`);
  console.log(`  内容代理：${BRIDGE_ORIGIN}`);
  console.log(`  视频缓存：${CACHE_DIR}`);
});
