import { createFileRoute } from '@tanstack/react-router';
import { institutionListSearch } from '@/entities/academic/model';
import { academicInstitutionsQueryOptions } from '@/entities/academic/queries';
import { InstitutionsPage } from '@/features/console-academic';

export const Route = createFileRoute('/console/instituicoes/')({
  staticData: { crumb: 'Instituições' },
  validateSearch: institutionListSearch.schema,
  search: { middlewares: institutionListSearch.middlewares },
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context: { queryClient }, deps }) => {
    void queryClient.prefetchQuery(
      academicInstitutionsQueryOptions(
        institutionListSearch.toApiParams(deps.search),
      ),
    );
  },
  component: InstitutionsRoute,
});

function InstitutionsRoute() {
  const search = Route.useSearch();
  return <InstitutionsPage search={search} />;
}
