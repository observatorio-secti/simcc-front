import { createFileRoute } from '@tanstack/react-router';
import { IndicatorsPage } from '@/features/indicators/indicators-page';
import { productionMetricQueryOptions } from '@/features/indicators/queries';
import {
  DEFAULT_INDICATOR_KIND,
  indicatorsSearchSchema,
  toProductionMetricQuery,
} from '@/features/indicators/search-schema';

export const Route = createFileRoute('/_public/indicadores')({
  staticData: { crumb: 'Indicadores' },
  validateSearch: indicatorsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      productionMetricQueryOptions(
        deps.kind ?? DEFAULT_INDICATOR_KIND,
        toProductionMetricQuery(deps),
      ),
    ),
  component: IndicadoresRouteComponent,
});

function IndicadoresRouteComponent() {
  const search = Route.useSearch();
  return <IndicatorsPage search={search} />;
}
