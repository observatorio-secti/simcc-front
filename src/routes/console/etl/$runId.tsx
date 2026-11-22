import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { etlRunDetailSearchSchema } from '@/entities/etl/model';
import { etlRunQueryOptions } from '@/entities/etl/queries';
import { EtlRunDetailPage } from '@/features/console-etl/etl-run-detail-page';

export const Route = createFileRoute('/console/etl/$runId')({
  staticData: { crumb: 'Execução' },
  validateSearch: etlRunDetailSearchSchema,
  search: {
    middlewares: [stripSearchParams({ tab: 'etapas', level: 'all' })],
  },
  loader: ({ context: { queryClient }, params }) => {
    void queryClient.prefetchQuery(etlRunQueryOptions(params.runId));
  },
  component: EtlRunDetailRoute,
});

function EtlRunDetailRoute() {
  const { runId } = Route.useParams();
  const search = Route.useSearch();
  return <EtlRunDetailPage runId={runId} search={search} />;
}
