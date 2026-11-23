# 红果免费短剧 · Web 版

> **仅供学习交流使用（For learning and study only）**。请勿用于商业用途。

基于公开接口的第三方网页实现：真实内容、真实播放、无广告、无需登录。

## 特性

- **真实内容**：首页推荐流、搜索、剧集详情、演员主页、榜单（热播榜/真人剧榜/漫剧榜/AI剧榜）全部来自真实接口
- **真实播放**：原片为 H.265 + CENC 加密，服务端解密后：
  - 支持 HEVC 的浏览器 → **原画流式直放**（首帧 ~0.5s，可拖动）
  - 其他浏览器 → **流式转码 H.264**（首帧 ~0.7s，边转边播，后台缓存）
- **完整页面**：首页 / 剧场 / 播放 / 详情 / 演员主页 / 榜单 / 搜索 / 听书 / 书架 / 历史 / 收藏 / 我的 / 设置 / 下载 / 青少年模式 / 关于 / 消息（17 个页面）
- **可点击跳转**：演员 → 演员主页，榜单标签 → 榜单页
- **无广告、无金币任务、无需登录、全剧集免费**

## 快速开始

```bash
# 1) 获取内容桥接服务（第三方开源项目，GPL-3.0）
git clone https://github.com/N3urda/hongguoTV
npm ci --prefix hongguoTV/server

# 2) 启动
bash webapp/start.sh
# 打开 http://127.0.0.1:8899
```

或手动启动：

```bash
node hongguoTV/server/index.mjs --lan    # 内容桥接（8787）
cd webapp && node server.js              # 网页版（8899）
```

环境变量：

| 变量 | 默认 | 说明 |
|---|---|---|
| `HONGGUO_VENDOR_DIR` | `../hongguoTV/server` | 内容源目录 |
| `BRIDGE_ORIGIN` | `http://127.0.0.1:8787` | bridge 地址 |
| `VIDEO_CACHE_DIR` | `webapp/.cache/videos` | 视频缓存目录 |
| `PORT` | `8899` | 网页版端口 |
| `TRANSCODE_PRESET` / `TRANSCODE_CRF` | `superfast` / `28` | 转码参数 |

## 播放架构

```
video_model（签名请求，设备指纹随机化+失败轮换）
  → 取明文 CDN 地址（video_list，含 spade_a 密钥）
  ├─ raw  ：bridge 流式解密（Range 按需，1MB 段）→ 浏览器 HEVC 直放
  └─ h264 ：流式转码（ffmpeg → fragmented MP4）→ 边转边播 + 后台缓存
```

## 目录

```
webapp/
├── index.html      # 应用外壳
├── styles.css      # 深色主题
├── app.js          # 路由 / 页面 / 播放器 / 交互
├── server.js       # 静态服务 + 内容代理 + 解密转码 + Range 服务
├── start.sh        # 一键启动
└── README.md       # 详细说明
```

## 免责声明

- **本项目仅供学习交流使用**，与官方无任何关联
- 内容接口为非官方实现，内容版权归原平台所有
- 不包含广告、金币、登录等商业功能
- 请勿用于商业用途；如相关方有异议请联系删除

## 致谢

- [N3urda/hongguoTV](https://github.com/N3urda/hongguoTV)（GPL-3.0）：内容源与流式解密
- 本项目未包含其代码，仅运行时依赖；相关文件保留其原始许可证与来源记录

## License

MIT（仅本项目代码）

