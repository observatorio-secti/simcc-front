import {
  createFileRoute,
  useLocation,
  useRouter,
} from '@tanstack/react-router';
import { researcherListSearch } from '@/entities/academic/model';
import {
  academicResearcherDetailQueryOptions,
  academicResearchersQueryOptions,
} from '@/entities/academic/queries';
import {
  ResearcherDetailOverlay,
  ResearchersPage,
} from '@/features/console-academic';

declare module '@tanstack/react-router' {
  interface HistoryState {
    /** Marca a entrada do histórico em que `/console/pesquisadores` abriu o overlay. */
    consoleResearcherOverlay?: boolean;
  }
}

export const Route = createFileRoute('/console/pesquisadores/')({
  staticData: { crumb: 'Pesquisadores' },
  validateSearch: researcherListSearch.schema,
  search: { middlewares: researcherListSearch.middlewares },
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context: { queryClient }, deps }) => {
    void queryClient.prefetchQuery(
      academicResearchersQueryOptions(
        researcherListSearch.toApiParams(deps.search),
      ),
    );
    if (deps.search.researcher) {
      void queryClient.prefetchQuery(
        academicResearcherDetailQueryOptions(deps.search.researcher),
      );
    }
  },
  component: ResearchersRoute,
});

function ResearchersRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const openedHere = useLocation({
    select: (location) => Boolean(location.state.consoleResearcherOverlay),
  });

  function handleOpenResearcher(researcherId: string) {
    void navigate({
      search: (prev) => ({ ...prev, researcher: researcherId }),
      mask: {
        to: '/console/pesquisadores/$researcherId',
        params: { researcherId },
      },
      state: (prev) => ({ ...prev, consoleResearcherOverlay: true }),
      replace: Boolean(search.researcher),
      resetScroll: false,
    });
  }

  function handleCloseOverlay() {
    if (openedHere && router.history.canGoBack()) {
      router.history.back();
      return;
    }
    void navigate({
      search: (prev) => ({ ...prev, researcher: undefined }),
      replace: true,
      resetScroll: false,
    });
  }

  return (
    <>
      <ResearchersPage
        search={search}
        onOpenResearcher={handleOpenResearcher}
      />
      <ResearcherDetailOverlay
        researcherId={search.researcher}
        onClose={handleCloseOverlay}
      />
    </>
  );
}
