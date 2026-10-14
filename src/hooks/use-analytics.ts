import { useQuery } from '@tanstack/react-query';
import {
  fetchAnalyticsMetrics,
  AnalyticsDashboardData,
  AnalyticsQueryParams,
} from '../services/analytics';

export function useAnalyticsMetrics(params?: AnalyticsQueryParams) {
  return useQuery<AnalyticsDashboardData, Error>({
    queryKey: ['console', 'analytics-metrics', params],
    queryFn: () => fetchAnalyticsMetrics(params),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache em memória
    refetchOnWindowFocus: false,
  });
}
