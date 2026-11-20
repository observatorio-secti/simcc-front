import { useQuery } from '@tanstack/react-query';
import {
  fetchAnalyticsMetrics,
  getAnalyticsPages,
  AnalyticsDashboardData,
  AnalyticsQueryParams,
  AnalyticsSystem,
} from '../services/analytics';

export function useAnalyticsPages(
  system: AnalyticsSystem,
  limit: number,
  offset: number,
) {
  return useQuery({
    queryKey: ['console', 'analytics-pages', system, limit, offset],
    queryFn: () => getAnalyticsPages(system, limit, offset),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useAnalyticsMetrics(params?: AnalyticsQueryParams) {
  return useQuery<AnalyticsDashboardData, Error>({
    queryKey: ['console', 'analytics-metrics', params],
    queryFn: () => fetchAnalyticsMetrics(params),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache em memória
    refetchOnWindowFocus: false,
  });
}
