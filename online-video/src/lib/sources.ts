import type { SourceDefinition, SourceId } from "@/lib/types";

export const SOURCES: readonly SourceDefinition[] = [
  {
    id: "liangzi",
    name: "量子",
    baseUrl: "https://cj.lziapi.com/api.php/provide/vod/",
  },
  
  {
    id: "ryzy",
    name: "如意",
    baseUrl: "https://cj.rycjapi.com/api.php/provide/vod/",
  },
  {
    id: "360",
    name: "360",
    baseUrl: "https://360zyzz.com/api.php/provide/vod/",
  },
  {
    id: "bfzy",
    name: "暴风",
    baseUrl: "https://bfzyapi.com/api.php/provide/vod/",
  },
  {
    id: "niuniu",
    name: "牛牛",
    baseUrl: "https://api.niuniuzy.me/api.php/provide/vod/",
  },
  {
    id: "yaya",
    name: "丫丫",
    baseUrl: "https://cj.yayazy.net/api.php/provide/vod/",
  },
  {
    id: "hongniu",
    name: "红牛",
    baseUrl: "https://www.hongniuzy2.com/api.php/provide/vod/",
  },
  {
    id: "suoni",
    name: "索尼",
    baseUrl: "https://suoniapi.com/api.php/provide/vod/",
  },
  {
    id: "ffzy",
    name: "非凡",
    baseUrl: "http://api.ffzyapi.com/api.php/provide/vod/",
  },
] as const;

export const DEFAULT_SOURCE_ID: SourceId = "liangzi";

export function getSource(sourceId: string) {
  return SOURCES.find((source) => source.id === sourceId) ?? null;
}
