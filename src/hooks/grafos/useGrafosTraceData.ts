import { useEffect, useState } from 'react';
import {
  fetchAreaTrace,
  fetchArticleTrace,
  fetchSubtopicTrace,
  fetchTopicTrace,
} from '../../services/grafos-trace';
import type {
  AreaTraceItem,
  ArticleTraceItem,
  RawSubtopicTraceItem,
  RawTopicTraceItem,
} from '../../types/grafos-trace';

export interface GrafosTraceData {
  taxonomyName: string;
  areas: AreaTraceItem[];
  topics: RawTopicTraceItem[];
  subtopics: RawSubtopicTraceItem[];
  articles: ArticleTraceItem[];
}

export function useGrafosTraceData(taxonomyName: string | null) {
  const [traceData, setTraceData] = useState<GrafosTraceData | null>(null);
  const [traceError, setTraceError] = useState<string | null>(null);
  const [traceLoading, setTraceLoading] = useState(false);

  useEffect(() => {
    if (!taxonomyName) return;
    let cancelled = false;
    setTraceLoading(true);
    Promise.all([
      fetchAreaTrace({ taxonomyName }),
      fetchTopicTrace({ taxonomyName }),
      fetchSubtopicTrace({ taxonomyName }),
      fetchArticleTrace({ taxonomyName }),
    ])
      .then(([areaRes, topicRes, subtopicRes, articleRes]) => {
        if (cancelled) return;
        setTraceData({
          taxonomyName,
          areas: areaRes.items,
          topics: topicRes.items,
          subtopics: subtopicRes.items,
          articles: articleRes.items,
        });
        setTraceError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setTraceData({
          taxonomyName,
          areas: [],
          topics: [],
          subtopics: [],
          articles: [],
        });
        setTraceError(
          err instanceof Error ? err.message : 'Erro ao carregar dados.',
        );
      })
      .finally(() => {
        if (!cancelled) setTraceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [taxonomyName]);

  return { traceData, traceError, traceLoading };
}
