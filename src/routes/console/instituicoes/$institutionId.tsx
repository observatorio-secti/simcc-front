import { createFileRoute } from '@tanstack/react-router';
import { institutionDetailResearcherSearch } from '@/entities/academic/model';
import {
  academicInstitutionDetailQueryOptions,
  academicResearchersQueryOptions,
} from '@/entities/academic/queries';
import { InstitutionDetailPage } from '@/features/console-academic';

export const Route = createFileRoute('/console/instituicoes/$institutionId')({
  staticData: { crumb: 'Detalhes da instituição' },
  validateSearch: institutionDetailResearcherSearch.schema,
  search: { middlewares: institutionDetailResearcherSearch.middlewares },
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context: { queryClient }, params, deps }) => {
    void queryClient.prefetchQuery(
      academicInstitutionDetailQueryOptions(params.institutionId),
    );
    void queryClient.prefetchQuery(
      academicResearchersQueryOptions({
        ...institutionDetailResearcherSearch.toApiParams(deps.search),
        institution_id: params.institutionId,
      }),
    );
  },
  component: InstitutionDetailRoute,
});

function InstitutionDetailRoute() {
  const { institutionId } = Route.useParams();
  const search = Route.useSearch();
  return (
    <InstitutionDetailPage institutionId={institutionId} search={search} />
  );
}
