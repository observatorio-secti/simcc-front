import { QueryClient } from '@tanstack/react-query';

/** Erros 4xx não melhoram com nova tentativa; 5xx e falhas de rede, sim. */
function shouldRetry(failureCount: number, error: unknown) {
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status: unknown }).status)
      : undefined;
  if (status !== undefined && status >= 400 && status < 500) return false;
  return failureCount < 2;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
    },
  });
}
