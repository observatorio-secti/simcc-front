export interface GaDimensionValue {
  value: string;
}

export interface GaMetricValue {
  value: string;
}

export interface GaRow {
  dimensionValues: GaDimensionValue[];
  metricValues: GaMetricValue[];
}

export interface GaReportResponse {
  rows?: GaRow[];
  rowCount?: number;
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

export interface AnalyticsSummary {
  totalPageViews: number;
  totalSessions: number;
  totalNewUsers: number;
  totalEvents: number;
  dailyTrends: DailyMetric[];
  topCountries: CountryMetric[];
  eventBreakdown: EventMetric[];
  avgDailyPageViews: number;
}

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

export const fetchAnalyticsMetrics = async (): Promise<AnalyticsSummary> => {
  const serverUrl = import.meta.env.VITE_URL_SERVER || 'http://localhost:3000/';
  const cleanServerUrl = serverUrl.endsWith('/') ? serverUrl : `${serverUrl}/`;

  const response = await fetch(`${cleanServerUrl}api/analytics`);

  if (!response.ok) {
    throw new Error(`Falha ao obter dados analíticos (${response.status})`);
  }

  const data: GaReportResponse = await response.json();
  const rows = data.rows || [];

  let totalPageViews = 0;
  let totalSessions = 0;
  let totalNewUsers = 0;
  let totalEvents = 0;

  const countryCounts: Record<string, number> = {};
  const eventCounts: Record<string, number> = {};
  const dailyMap: Record<
    string,
    { dateRaw: string; pageViews: number; sessions: number; activeUsers: number }
  > = {};

  for (const row of rows) {
    const dateRaw = row.dimensionValues?.[0]?.value || '';
    const eventName = row.dimensionValues?.[1]?.value || '';
    const country = row.dimensionValues?.[2]?.value || 'Outro';
    const eventCount = parseInt(row.metricValues?.[0]?.value || '0', 10);
    const activeUsers = parseInt(row.metricValues?.[1]?.value || '0', 10);

    totalEvents += eventCount;
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

  // Ordena dias cronologicamente
  const sortedDates = Object.keys(dailyMap).sort();
  const dailyTrends: DailyMetric[] = sortedDates.map((dateKey) => {
    const item = dailyMap[dateKey];
    const day = item.dateRaw.substring(6, 8);
    const month = item.dateRaw.substring(4, 6);
    return {
      dateRaw: item.dateRaw,
      dateFormatted: `${day}/${month}`,
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

  return {
    totalPageViews,
    totalSessions,
    totalNewUsers,
    totalEvents,
    dailyTrends,
    topCountries,
    eventBreakdown,
    avgDailyPageViews,
  };
};
