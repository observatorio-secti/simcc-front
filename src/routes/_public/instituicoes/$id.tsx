import { createFileRoute } from '@tanstack/react-router';
import { institutionDetailQueryOptions } from '@/entities/institution/queries';
import { ErrorPage } from '@/features/errors/error-page';
import { InstitutionDetailPage } from '@/features/institutions/institution-detail-page';
import { institutionDetailSearch } from '@/features/institutions/search-schema';

export const Route = createFileRoute('/_public/instituicoes/$id')({
  staticData: { crumb: 'Instituição' },
  validateSearch: institutionDetailSearch.schema,
  search: {
    middlewares: institutionDetailSearch.middlewares,
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      institutionDetailQueryOptions(params.id),
    ),
  errorComponent: ErrorPage,
  component: InstitutionDetailRoute,
});

function InstitutionDetailRoute() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  return <InstitutionDetailPage institutionId={id} search={search} />;
}
