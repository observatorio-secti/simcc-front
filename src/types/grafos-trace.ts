// Types de rastreabilidade.
// Port de prototipo-classificador-pesquisadores/frontend/src/types/trace.ts

export interface AreaTraceItem {
  number: number;
  area: string;
}

export interface AreaTraceResponse {
  items: AreaTraceItem[];
  total: number;
}

export interface RawTopicTraceItem {
  topic: string;
  area: string;
}

export interface TopicTraceResponse {
  items: RawTopicTraceItem[];
  total: number;
}

export interface RawSubtopicTraceItem {
  subtopic: string;
  topic: string;
  area: string;
}

export interface SubtopicTraceResponse {
  items: RawSubtopicTraceItem[];
  total: number;
}

export interface ResearcherTraceItem {
  researcher_name: string;
  area_labels: string;
  topic_label: string;
  subtopic_label: string;
  article_count: number;
}

export interface ResearcherTraceResponse {
  items: ResearcherTraceItem[];
  total: number;
}

export interface ArticleTraceItem {
  title: string;
  year: string | null;
  researcher_name: string;
  area_labels: string;
  topic_label: string;
  subtopic_label: string;
  periodical: string;
  qualis: string;
  jcr: string;
  abstract: string;
}

export interface ArticleTraceResponse {
  items: ArticleTraceItem[];
  total: number;
}

export interface TopicTraceItem {
  id: string;
  topic: string;
  area: string;
  articleCount: number;
}

export interface SubtopicTraceItem {
  id: string;
  subtopic: string;
  topic: string;
  area: string;
  articleCount: number;
}

export type TraceOrigin =
  | 'areas'
  | 'topics'
  | 'subtopics'
  | 'researchers'
  | 'articles'
  | null;

export interface TraceSelection {
  origin: TraceOrigin;
  areas: string[];
  topics: string[];
  subtopics: string[];
  researcher: string | null;
}
