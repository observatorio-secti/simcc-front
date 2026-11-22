import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { etlRunsListParams, etlRunsSearchSchema } from '@/entities/etl/model';
import { etlRunsQueryOptions } from '@/entities/etl/queries';
import { EtlRunsPage } from '@/features/console-etl/etl-runs-page';

export const Route = createFileRoute('/console/etl/')({
  staticData: { crumb: 'Sincronização' },
  validateSearch: etlRunsSearchSchema,
  search: {
    middlewares: [stripSearchParams({ page: 1, per_page: 20 })],
  },
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context: { queryClient }, deps }) => {
    void queryClient.prefetchQuery(
      etlRunsQueryOptions(etlRunsListParams(deps.search)),
    );
  },
  component: EtlRunsRoute,
});

function EtlRunsRoute() {
  const search = Route.useSearch();
  return <EtlRunsPage search={search} />;
}
