import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsMetrics, AnalyticsSummary } from '../services/analytics';

export function useAnalyticsMetrics() {
  return useQuery<AnalyticsSummary, Error>({
    queryKey: ['console', 'analytics-metrics'],
    queryFn: fetchAnalyticsMetrics,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache em memória
    refetchOnWindowFocus: false,
  });
}
