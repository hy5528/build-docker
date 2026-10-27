export const ItemTypes = {
  MOVIE: "movie",
  TV: "tv",
};

export const DEFAULT_VIDEO_SOURCES = [
  {
    id: "1",
    name: "金鹰资源",
    key: "jyzy",
    url: "https://jinyingzy.com/api.php/provide/vod",
    enabled: true,
    type: "video",
  }, 
  {
    id: "2",
    name: "量子资源",
    key: "lzzy",
    url: "https://cj.lziapi.com/api.php/provide/vod",
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
    name: "旺旺短剧",
    key: "wwzy",
    url: "https://api.wwzy.tv/api.php/provide/vod",
    enabled: true,
    type: "video",
  },
];

export const DEFAULT_DANMAKU_SOURCES = [];
