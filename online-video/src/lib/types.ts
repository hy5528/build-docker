export const SOURCE_IDS = [
  "liangzi",
  "ruyi",
  "360",
  "niuniu",
  "yaya",
  "hongniu",
  "suoni",
  "ffzy",
] as const;

export type SourceId = (typeof SOURCE_IDS)[number];

export interface SourceDefinition {
  id: SourceId;
  name: string;
  baseUrl: string;
}

export interface Category {
  id: number;
  parentId: number;
  name: string;
}

export interface MovieSummary {
  id: string;
  sourceId: SourceId;
  name: string;
  cover: string;
  remarks: string;
  typeName: string;
  year: string;
  area: string;
  score: string;
}

export interface Episode {
  name: string;
  url: string;
}

export interface PlaybackLine {
  id: string;
  sourceId: SourceId;
  sourceName: string;
  movieId: string;
  playFrom: string;
  episodes: Episode[];
}

export interface MovieDetail extends MovieSummary {
  actor: string;
  director: string;
  writer: string;
  language: string;
  releaseDate: string;
  updatedAt: string;
  summary: string;
  playbackLines: PlaybackLine[];
}

export interface MoviePage {
  page: number;
  pageCount: number;
  total: number;
  items: MovieSummary[];
}

export interface HotRecommendation {
  id: string;
  name: string;
  cover: string;
  remarks: string;
}
