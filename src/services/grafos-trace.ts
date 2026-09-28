import type {
  AreaTraceResponse,
  ArticleTraceResponse,
  ResearcherTraceResponse,
  SubtopicTraceResponse,
  TopicTraceResponse,
} from '../types/grafos-trace';

const API_BASE =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8001';

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail ?? `Erro ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export interface TraceQueryParams {
  taxonomyName?: string;
  minYear?: number;
  maxYear?: number;
}

export interface TaxonomyNameParam {
  taxonomyName?: string;
}

function buildQuery({
  taxonomyName,
  minYear,
  maxYear,
}: TraceQueryParams = {}): string {
  const params = new URLSearchParams();
  if (taxonomyName) params.set('taxonomy_name', taxonomyName);
  if (minYear !== undefined) params.set('min_year', String(minYear));
  if (maxYear !== undefined) params.set('max_year', String(maxYear));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function buildTaxonomyQuery({ taxonomyName }: TaxonomyNameParam = {}): string {
  return taxonomyName
    ? `?taxonomy_name=${encodeURIComponent(taxonomyName)}`
    : '';
}

export async function fetchAreaTrace(
  params?: TraceQueryParams,
): Promise<AreaTraceResponse> {
  return apiFetch<AreaTraceResponse>(`/classifier/trace/areas${buildQuery(params)}`);
}

export async function fetchTopicTrace(
  params?: TaxonomyNameParam,
): Promise<TopicTraceResponse> {
  return apiFetch<TopicTraceResponse>(
    `/classifier/trace/topics${buildTaxonomyQuery(params)}`,
  );
}

export async function fetchSubtopicTrace(
  params?: TaxonomyNameParam,
): Promise<SubtopicTraceResponse> {
  return apiFetch<SubtopicTraceResponse>(
    `/classifier/trace/subtopics${buildTaxonomyQuery(params)}`,
  );
}

export async function fetchResearcherTrace(
  params?: TraceQueryParams,
): Promise<ResearcherTraceResponse> {
  return apiFetch<ResearcherTraceResponse>(
    `/classifier/trace/researchers${buildQuery(params)}`,
  );
}

export async function fetchArticleTrace(
  params?: TraceQueryParams,
): Promise<ArticleTraceResponse> {
  return apiFetch<ArticleTraceResponse>(`/classifier/trace/articles${buildQuery(params)}`);
}
