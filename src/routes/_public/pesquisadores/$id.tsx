import {
  createFileRoute,
  notFound,
  stripSearchParams,
} from '@tanstack/react-router';
import {
  researcherDetailQueryOptions,
  researcherTermsQueryOptions,
} from '@/entities/researcher/queries';
import { NotFoundPage } from '@/features/errors/not-found-page';
import {
  isNotFoundApiError,
  researcherScholarshipsQueryOptions,
} from '@/features/researcher-profile/queries';
import { ResearcherProfilePage } from '@/features/researcher-profile/researcher-profile-page';
import {
  cleanProfileSearch,
  PROFILE_SEARCH_DEFAULTS,
  researcherProfileSearchSchema,
  type ResearcherProfileSearch,
} from '@/features/researcher-profile/search-schema';

export const Route = createFileRoute('/_public/pesquisadores/$id')({
  staticData: { crumb: 'Pesquisador' },
  validateSearch: researcherProfileSearchSchema,
  // Omite os padrões (aba, página, visão) da URL, inclusive na máscara do
  // overlay aberto a partir da busca (ADR 0010).
  search: {
    middlewares: [stripSearchParams(PROFILE_SEARCH_DEFAULTS)],
  },
  loader: async ({ context, params }) => {
    try {
      const detail = await context.queryClient.ensureQueryData(
        researcherDetailQueryOptions(params.id),
      );
      void context.queryClient.prefetchQuery(
        researcherTermsQueryOptions(params.id, { limit: 25 }),
      );
      void context.queryClient.prefetchQuery(
        researcherScholarshipsQueryOptions(params.id),
      );
      return detail;
    } catch (error) {
      if (isNotFoundApiError(error)) {
        throw notFound();
      }
      throw error;
    }
  },
  notFoundComponent: NotFoundPage,
  component: ResearcherProfileRoute,
});

function ResearcherProfileRoute() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  function handleUpdateSearch(patch: Partial<ResearcherProfileSearch>) {
    void navigate({
      search: (prev) =>
        cleanProfileSearch({ ...prev, ...patch }) as ResearcherProfileSearch,
      replace: true,
    });
  }

  return (
    <ResearcherProfilePage
      researcherId={id}
      search={search}
      onUpdateSearch={handleUpdateSearch}
    />
  );
}
