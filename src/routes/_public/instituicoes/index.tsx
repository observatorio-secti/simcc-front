import { createFileRoute } from '@tanstack/react-router';
import { institutionListQueryOptions } from '@/entities/institution/queries';
import { ErrorPage } from '@/features/errors/error-page';
import { InstitutionsListPage } from '@/features/institutions/institutions-list-page';
import { institutionListSearch } from '@/features/institutions/search-schema';

export const Route = createFileRoute('/_public/instituicoes/')({
  staticData: { crumb: 'Instituições' },
  validateSearch: institutionListSearch.schema,
  search: {
    middlewares: institutionListSearch.middlewares,
  },
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      institutionListQueryOptions(
        institutionListSearch.toApiParams(deps.search),
      ),
    ),
  errorComponent: ErrorPage,
  component: InstitutionsRoute,
});

function InstitutionsRoute() {
  const search = Route.useSearch();
  return <InstitutionsListPage search={search} />;
}
