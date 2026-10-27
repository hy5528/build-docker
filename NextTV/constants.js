export const ItemTypes = {
  MOVIE: "movie",
  TV: "tv",
};

export const DEFAULT_VIDEO_SOURCES = [
  {
    id: "1",
    name: "电影天堂",
    key: "dytt",
    url: "https://caiji.dyttzyapi.com/api.php/provide/vod",
    enabled: true,
    type: "video",
  },
  {
    id: "2",
    name: "天涯资源",
    key: "tyzy",
    url: "https://ty.tyyszy5.com/api.php/provide/vod/",
    enabled: true,
    type: "video",
  },
  {
    id: "3",
    name: "如意云",
    key: "ryzy",
    url: "https://cj.rycjapi.com/api.php/provide/vod",
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
