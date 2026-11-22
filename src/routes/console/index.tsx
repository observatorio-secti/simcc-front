import { createFileRoute } from '@tanstack/react-router';
import { academicCountQueryOptions } from '@/entities/academic/queries';
import { adminCountQueryOptions } from '@/entities/admin/queries';
import { latestEtlRunQueryOptions } from '@/entities/etl/queries';
import { ConsoleOverviewPage } from '@/features/console/overview-page';

export const Route = createFileRoute('/console/')({
  // Pré-carrega sem bloquear: cada bloco da visão geral trata o próprio erro.
  loader: ({ context: { queryClient } }) => {
    void queryClient.prefetchQuery(latestEtlRunQueryOptions());
    void queryClient.prefetchQuery(academicCountQueryOptions.institutions());
    void queryClient.prefetchQuery(academicCountQueryOptions.researchers());
    void queryClient.prefetchQuery(academicCountQueryOptions.collections());
    void queryClient.prefetchQuery(adminCountQueryOptions());
  },
  component: ConsoleOverviewPage,
});
