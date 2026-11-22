import { createFileRoute } from '@tanstack/react-router';
import { IndicatorsPage } from '@/features/indicators/indicators-page';
import { indicatorsSearchSchema } from '@/features/indicators/search-schema';

export const Route = createFileRoute('/_public/indicadores')({
  staticData: { crumb: 'Indicadores' },
  validateSearch: indicatorsSearchSchema,
  component: IndicadoresRouteComponent,
});

function IndicadoresRouteComponent() {
  const search = Route.useSearch();
  return <IndicatorsPage search={search} />;
}
