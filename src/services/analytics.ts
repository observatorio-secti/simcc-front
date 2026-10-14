import { api } from '../lib/api';

/**
 * Item individual de métrica retornado pelo GA4 normalizado na V2.
 */
export interface AnalyticsMetricItem {
  /** Data da ocorrência no formato YYYYMMDD (ex: "20241010") */
  date: string;
  /** Nome do evento registrado no GA4 (ex: "page_view") */
  event_name: string;
  /** País de origem dos usuários (ex: "Brazil") */
  country: string;
  /** Domínio acessado (ex: "simcc.uesc.br") */
  host_name: string;
  /** Total de disparos do evento */
  event_count: number;
  /** Usuários ativos únicos que dispararam o evento */
  active_users: number;
}

/**
 * Resumo acumulado retornado pelo endpoint V2.
 */
export interface AnalyticsSummary {
  /** Total acumulado de eventos no período */
  total_events: number;
  /** Total acumulado de usuários ativos no período */
  total_active_users: number;
  /** Data inicial consultada */
  start_date: string;
  /** Data final consultada */
  end_date: string;
}

/**
 * Resposta padrão da rota GET /v2/analytics.
 */
export interface AnalyticsResponse {
  data: AnalyticsMetricItem[];
  summary: AnalyticsSummary;
}

/**
 * Parâmetros de consulta (Query Parameters) aceitos pelo endpoint V2.
 */
export interface AnalyticsQueryParams {
  start_date?: string;
  end_date?: string;
  event_name?: string;
  host_name?: string;
}

export interface DailyMetric {
  dateRaw: string;
  dateFormatted: string;
  pageViews: number;
  sessions: number;
  activeUsers: number;
}

export interface CountryMetric {
  country: string;
  pageViews: number;
  percentage: number;
}

export interface EventMetric {
  eventName: string;
  eventLabel: string;
  count: number;
  percentage: number;
}

export interface AnalyticsDashboardData {
  totalPageViews: number;
  totalSessions: number;
  totalNewUsers: number;
  totalActiveUsers: number;
  totalEvents: number;
  dailyTrends: DailyMetric[];
  topCountries: CountryMetric[];
  eventBreakdown: EventMetric[];
  avgDailyPageViews: number;
  summary: AnalyticsSummary;
}

// Alias para manter retrocompatibilidade com componentes que importavam AnalyticsSummary
export type AnalyticsDashboardSummary = AnalyticsDashboardData;

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Visualizações de Página',
  session_start: 'Sessões Iniciadas',
  first_visit: 'Novos Visitantes',
  scroll: 'Rolagens de Conteúdo',
  user_engagement: 'Engajamento de Sessão',
  click: 'Cliques e Interações',
};

const COUNTRY_TRANSLATIONS: Record<string, string> = {
  Brazil: 'Brasil',
  'Hong Kong': 'Hong Kong',
  'United States': 'Estados Unidos',
  China: 'China',
  Singapore: 'Singapura',
  Poland: 'Polônia',
  Germany: 'Alemanha',
  France: 'França',
  Portugal: 'Portugal',
  Spain: 'Espanha',
  Canada: 'Canadá',
  Japan: 'Japão',
};

/**
 * Consulta direta ao endpoint V2 da API Geral (FastAPI): GET /v2/analytics
 */
export const getAnalytics = async (
  params?: AnalyticsQueryParams,
): Promise<AnalyticsResponse> => {
  // Limpa parâmetros indefinidos/nulos/vazios para não enviar query indevida (evitando erro 422 na FastAPI)
  const cleanedParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanedParams[key] = String(value);
      }
    });
  }

  const { data } = await api.get<AnalyticsResponse>('v2/analytics', {
    params: Object.keys(cleanedParams).length > 0 ? cleanedParams : undefined,
  });

  return data;
};

/**
 * Processa a resposta fortemente tipada da API V2 para alimentar os gráficos e painéis da dashboard.
 */
export const fetchAnalyticsMetrics = async (
  params?: AnalyticsQueryParams,
): Promise<AnalyticsDashboardData> => {
  const response = await getAnalytics(params);
  const items = response.data || [];

  let totalPageViews = 0;
  let totalSessions = 0;
  let totalNewUsers = 0;
  let totalEventsCalculated = 0;

  const countryCounts: Record<string, number> = {};
  const eventCounts: Record<string, number> = {};
  const dailyMap: Record<
    string,
    {
      dateRaw: string;
      pageViews: number;
      sessions: number;
      activeUsers: number;
    }
  > = {};

  for (const item of items) {
    const dateRaw = item.date || '';
    const eventName = item.event_name || '';
    const country = item.country || 'Outro';
    const eventCount = Number(item.event_count || 0);
    const activeUsers = Number(item.active_users || 0);

    totalEventsCalculated += eventCount;
    eventCounts[eventName] = (eventCounts[eventName] || 0) + eventCount;

    if (eventName === 'page_view') {
      totalPageViews += eventCount;
      const translatedCountry = COUNTRY_TRANSLATIONS[country] || country;
      countryCounts[translatedCountry] =
        (countryCounts[translatedCountry] || 0) + eventCount;
    }

    if (eventName === 'session_start') {
      totalSessions += eventCount;
    }

    if (eventName === 'first_visit') {
      totalNewUsers += eventCount;
    }

    if (dateRaw) {
      if (!dailyMap[dateRaw]) {
        dailyMap[dateRaw] = {
          dateRaw,
          pageViews: 0,
          sessions: 0,
          activeUsers: 0,
        };
      }

      if (eventName === 'page_view') {
        dailyMap[dateRaw].pageViews += eventCount;
      }
      if (eventName === 'session_start') {
        dailyMap[dateRaw].sessions += eventCount;
      }
      dailyMap[dateRaw].activeUsers = Math.max(
        dailyMap[dateRaw].activeUsers,
        activeUsers,
      );
    }
  }

  // Ordena os dias cronologicamente
  const sortedDates = Object.keys(dailyMap).sort();
  const dailyTrends: DailyMetric[] = sortedDates.map((dateKey) => {
    const item = dailyMap[dateKey];
    let day = '';
    let month = '';

    if (item.dateRaw.includes('-')) {
      const parts = item.dateRaw.split('-');
      day = parts[2] || '';
      month = parts[1] || '';
    } else if (item.dateRaw.length >= 8) {
      day = item.dateRaw.substring(6, 8);
      month = item.dateRaw.substring(4, 6);
    } else {
      day = item.dateRaw;
    }

    return {
      dateRaw: item.dateRaw,
      dateFormatted: month ? `${day}/${month}` : day,
      pageViews: item.pageViews,
      sessions: item.sessions,
      activeUsers: item.activeUsers,
    };
  });

  // Top Países ordenados
  const topCountries: CountryMetric[] = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => ({
      country,
      pageViews: count,
      percentage: totalPageViews > 0 ? (count / totalPageViews) * 100 : 0,
    }));

  const totalEvents = response.summary?.total_events ?? totalEventsCalculated;

  // Distribuição de Eventos
  const eventBreakdown: EventMetric[] = Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      eventName: name,
      eventLabel: EVENT_LABELS[name] || name,
      count,
      percentage: totalEvents > 0 ? (count / totalEvents) * 100 : 0,
    }));

  const dayCount = dailyTrends.length || 1;
  const avgDailyPageViews = Math.round(totalPageViews / dayCount);
  const totalActiveUsers = response.summary?.total_active_users ?? 0;

  return {
    totalPageViews,
    totalSessions,
    totalNewUsers,
    totalActiveUsers,
    totalEvents,
    dailyTrends,
    topCountries,
    eventBreakdown,
    avgDailyPageViews,
    summary: response.summary,
  };
};
