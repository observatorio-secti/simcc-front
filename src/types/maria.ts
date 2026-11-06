// Contrato da API da Maria (observatorio-maria): conversas e blocos de conteúdo.

export interface MariaBlockCoverage {
  keys: number;
  found: number;
}

export interface MariaBlockOrigin {
  sources: string[];
  description: string;
  queried_at: string;
  coverage?: MariaBlockCoverage | null;
}

export interface MariaTextBlock {
  type: 'text';
  text: string;
}

export interface MariaChartAxis {
  key: string;
  label: string;
  type?: 'category' | 'number' | 'date';
}

export interface MariaChartSeries {
  key: string;
  label: string;
  unit?: string | null;
}

export interface MariaChartBlock {
  type: 'chart';
  chart_type: 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'scatter';
  title: string;
  x: MariaChartAxis;
  series: MariaChartSeries[];
  data: Record<string, unknown>[];
  group?: { key: string; label: string } | null;
  orientation?: 'vertical' | 'horizontal';
  stacking?: 'absolute' | 'percent' | null;
  truncated?: boolean;
  origin?: MariaBlockOrigin | null;
}

export interface MariaTableColumn {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'date';
}

export interface MariaTableBlock {
  type: 'table';
  title?: string | null;
  columns: MariaTableColumn[];
  rows: Record<string, unknown>[];
  truncated?: boolean;
  origin?: MariaBlockOrigin | null;
}

export interface MariaResearcherMetrics {
  articles?: number;
  book_chapters?: number;
  books?: number;
  patents?: number;
  software?: number;
  brand?: number;
  total_productions?: number;
  h_index?: number | null;
  i10_index?: number | null;
  citations?: number | null;
}

export interface MariaResearcherAffiliation {
  institution_id?: string | null;
  institution_name?: string | null;
  institution_acronym?: string | null;
  city_name?: string | null;
}

export interface MariaResearcher {
  id: string;
  name: string;
  lattes_id?: string | null;
  abstract?: string | null;
  photo_url?: string | null;
  city?: string | null;
  state?: string | null;
  territory?: string | null;
  graduation?: string | null;
  openalex_id?: string | null;
  orcid?: string | null;
  affiliations?: MariaResearcherAffiliation[];
  metrics?: MariaResearcherMetrics;
}

export interface MariaResearchersBlock {
  type: 'researchers';
  title?: string | null;
  researchers: MariaResearcher[];
  total?: number;
  truncated?: boolean;
  origin?: MariaBlockOrigin | null;
}

export interface MariaProductionAuthor {
  name: string;
  lattes_id?: string | null;
  order?: number | null;
}

export interface MariaProductionDetails {
  qualis?: string | null;
  doi?: string | null;
  issn?: string | null;
  isbn?: string | null;
  magazine?: string | null;
  event_name?: string | null;
  event_city?: string | null;
  nature?: string | null;
  grant_date?: string | null;
  status?: string | null;
}

export interface MariaProduction {
  id: string;
  title: string;
  type:
    | 'article'
    | 'book'
    | 'book_chapter'
    | 'patent'
    | 'software'
    | 'event'
    | string;
  type_label: string;
  year?: number | null;
  authors?: MariaProductionAuthor[];
  details?: MariaProductionDetails;
}

export interface MariaProductionsBlock {
  type: 'productions';
  title?: string | null;
  productions: MariaProduction[];
  total?: number;
  truncated?: boolean;
  origin?: MariaBlockOrigin | null;
}

export interface MariaSuggestionsBlock {
  type: 'suggestions';
  questions: string[];
}

export type MariaKnownBlock =
  | MariaTextBlock
  | MariaChartBlock
  | MariaTableBlock
  | MariaResearchersBlock
  | MariaProductionsBlock
  | MariaSuggestionsBlock;

// Tipos novos da API chegam sem quebrar o cliente: são ignorados na renderização.
export type MariaBlock =
  | MariaKnownBlock
  | { type: string; [key: string]: unknown };

export interface MariaConversation {
  id: string;
  title: string | null;
  total_tokens: number;
  created_at: string;
  updated_at: string;
  questions_asked?: number;
  questions_limit?: number | null;
}

export interface MariaMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: MariaBlock[];
  created_at: string;
}

export interface MariaActivity {
  kind: 'query';
  source: string;
  description: string;
}

export interface MariaContentDelta {
  index: number;
  type: string;
  text?: string | null;
  block?: MariaBlock | null;
}

export type MariaStreamEvent =
  | { event: 'message.user'; data: MariaMessage }
  | { event: 'activity'; data: MariaActivity }
  | { event: 'content.delta'; data: MariaContentDelta }
  | { event: 'message.assistant'; data: MariaMessage }
  | { event: 'error'; data: { detail: string } };
