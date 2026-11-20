export const ItemTypes = {
  MOVIE: "movie",
  TV: "tv",
};

export const DEFAULT_VIDEO_SOURCES = [
  {
    id: "1",
    name: "非凡资源",
    key: "dytt",
    url: "http://api.ffzyapi.com/api.php/provide/vod/from/ffm3u8",
    enabled: true,
    type: "video",
  },
  {
    id: "2",
    name: "量子资源",
    key: "lzzy",
    url: "https://lzzyapi.com/api.php/provide/vod/from/lzm3u8",
    enabled: true,
    type: "video",
  },
  {
    id: "3",
    name: "聚合资源",
    key: "7nzy",
    url: "https://vod.7na7.com/",
    enabled: true,
    type: "video",
  },
  {
    id: "4",
    name: "金鹰资源",
    key: "jyzy",
    url: "https://jyzyapi.com/provide/vod/from/jinyingm3u8/at/json",
    enabled: true,
    type: "video",
  }
];

export const DEFAULT_DANMAKU_SOURCES = [
  {
    "name": "logvar",
    "url": "https://logvar.xiaohanys.top/shengke@12345",
    "id": "1777383442670",
    "enabled": true
  }
];
