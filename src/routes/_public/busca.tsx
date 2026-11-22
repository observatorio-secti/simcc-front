import {
  createFileRoute,
  useLocation,
  useRouter,
} from '@tanstack/react-router';
import { researcherDetailQueryOptions } from '@/entities/researcher/queries';
import { ErrorPage } from '@/features/errors/error-page';
import {
  decodeProfileOverlaySearch,
  encodeProfileOverlaySearch,
} from '@/features/researcher-profile/overlay-search';
import { ResearcherProfileOverlay } from '@/features/researcher-profile/researcher-profile-overlay';
import type { ResearcherProfileSearch } from '@/features/researcher-profile/search-schema';
import {
  prefetchSearchResults,
  resultsSearch,
  resultsSearchMiddlewares,
  SearchResultsPage,
} from '@/features/search';

declare module '@tanstack/react-router' {
  interface HistoryState {
    /** Marca a entrada do histórico em que `/busca` abriu o overlay do perfil. */
    searchOverlay?: boolean;
  }
}

export const Route = createFileRoute('/_public/busca')({
  staticData: { crumb: 'Busca' },
  validateSearch: resultsSearch.schema,
  search: { middlewares: resultsSearchMiddlewares },
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps }) => {
    prefetchSearchResults(context.queryClient, deps.search);
    if (deps.search.researcher) {
      void context.queryClient.prefetchQuery(
        researcherDetailQueryOptions(deps.search.researcher),
      );
    }
  },
  errorComponent: ErrorPage,
  component: BuscaRoute,
});

/**
 * `/busca` com o perfil do pesquisador como overlay (ADR 0004 e 0010). A
 * lista fica montada; abrir um pesquisador navega para `/busca?researcher=…`
 * mascarado como `/pesquisadores/$id`, então a barra de endereço mostra o
 * perfil, voltar fecha o overlay e o link copiado abre a página completa.
 */
function BuscaRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const openedHere = useLocation({
    select: (location) => Boolean(location.state.searchOverlay),
  });

  const type = search.type ?? 'profile';
  const profileSearch = decodeProfileOverlaySearch(search.profile, {
    q: search.q,
    searchType: type,
  });
  const { routeSearch } = encodeProfileOverlaySearch(profileSearch);

  function showResearcher(
    id: string,
    patch: Partial<ResearcherProfileSearch> | null,
    options: { replace: boolean },
  ) {
    const base = patch
      ? profileSearch
      : decodeProfileOverlaySearch(undefined, {
          q: search.q,
          searchType: type,
        });
    const next = encodeProfileOverlaySearch(base, patch ?? {});
    void navigate({
      search: (prev) => ({ ...prev, researcher: id, profile: next.encoded }),
      mask: {
        to: '/pesquisadores/$id',
        params: { id },
        search: next.routeSearch as ResearcherProfileSearch,
      },
      state: (prev) => ({ ...prev, searchOverlay: true }),
      replace: options.replace,
      resetScroll: false,
    });
  }

  function handleOpenResearcher(id: string) {
    showResearcher(id, null, { replace: Boolean(search.researcher) });
  }

  function handleUpdateProfile(patch: Partial<ResearcherProfileSearch>) {
    if (!search.researcher) return;
    showResearcher(search.researcher, patch, { replace: true });
  }

  function handleClose() {
    if (openedHere && router.history.canGoBack()) {
      router.history.back();
      return;
    }
    void navigate({
      search: (prev) => ({
        ...prev,
        researcher: undefined,
        profile: undefined,
      }),
      replace: true,
      resetScroll: false,
    });
  }

  return (
    <>
      <SearchResultsPage
        search={search}
        onOpenResearcher={handleOpenResearcher}
      />
      <ResearcherProfileOverlay
        researcherId={search.researcher}
        search={profileSearch}
        routeSearch={routeSearch}
        onUpdateSearch={handleUpdateProfile}
        onClose={handleClose}
      />
    </>
  );
}
