import {
  createFileRoute,
  useLocation,
  useRouter,
} from '@tanstack/react-router';
import {
  decodeProductionRef,
  encodeProductionRef,
  productionRouteParams,
} from '@/entities/production/links';
import type { ProductionKind } from '@/entities/production/model';
import { productionDetailQueryOptions } from '@/entities/production/queries';
import { researcherDetailQueryOptions } from '@/entities/researcher/queries';
import { ErrorPage } from '@/features/errors/error-page';
import { ProductionDetailOverlay } from '@/features/production-detail';
import {
  decodeProfileOverlaySearch,
  encodeProfileOverlaySearch,
} from '@/features/researcher-profile/overlay-search';
import { ResearcherProfileOverlay } from '@/features/researcher-profile/researcher-profile-overlay';
import type { ResearcherProfileSearch } from '@/features/researcher-profile/search-schema';
import {
  interceptResearcherLink,
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
    const production = decodeProductionRef(deps.search.production);
    if (production) {
      void context.queryClient.prefetchQuery(
        productionDetailQueryOptions(production.kind, production.id),
      );
    }
  },
  errorComponent: ErrorPage,
  component: BuscaRoute,
});

/**
 * `/busca` com o perfil do pesquisador e a produção como overlays (ADR 0004 e
 * 0010). A lista fica montada; abrir um pesquisador navega para
 * `/busca?researcher=…` mascarado como `/pesquisadores/$id`, e abrir uma
 * produção (de um card ou de dentro do perfil) navega para
 * `/busca?production=<kind>:<id>` mascarado como `/producoes/<slug>/<id>`.
 * A barra de endereço mostra a entidade do topo, voltar fecha só o overlay
 * do topo e o link copiado abre a página completa dessa entidade.
 */
function BuscaRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const openedHere = useLocation({
    select: (location) => Boolean(location.state.searchOverlay),
  });
  const productionOpenedHere = useLocation({
    select: (location) => Boolean(location.state.productionOverlay),
  });

  const type = search.type ?? 'profile';
  const profileSearch = decodeProfileOverlaySearch(search.profile, {
    q: search.q,
    searchType: type,
  });
  const { routeSearch } = encodeProfileOverlaySearch(profileSearch);
  const production = decodeProductionRef(search.production);

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
      search: (prev) => ({
        ...prev,
        researcher: id,
        profile: next.encoded,
        production: undefined,
      }),
      mask: {
        to: '/pesquisadores/$id',
        params: { id },
        search: next.routeSearch as ResearcherProfileSearch,
      },
      state: (prev) => ({
        ...prev,
        searchOverlay: true,
        productionOverlay: undefined,
      }),
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
        production: undefined,
      }),
      replace: true,
      resetScroll: false,
    });
  }

  function handleOpenProduction(kind: ProductionKind, id: string) {
    const ref = { kind, id };
    void navigate({
      search: (prev) => ({ ...prev, production: encodeProductionRef(ref) }),
      mask: { to: '/producoes/$kind/$id', params: productionRouteParams(ref) },
      state: (prev) => ({ ...prev, productionOverlay: true }),
      replace: Boolean(search.production),
      resetScroll: false,
    });
  }

  function handleCloseProduction() {
    if (productionOpenedHere && router.history.canGoBack()) {
      router.history.back();
      return;
    }
    // Aberta direto (link com `?production=`): remove o parâmetro e, se o
    // perfil continua aberto por baixo, a barra volta a mostrar o perfil.
    const researcher = search.researcher;
    void navigate({
      search: (prev) => ({ ...prev, production: undefined }),
      ...(researcher && {
        mask: {
          to: '/pesquisadores/$id',
          params: { id: researcher },
          search: routeSearch as ResearcherProfileSearch,
        },
      }),
      state: (prev) => ({ ...prev, productionOverlay: undefined }),
      replace: true,
      resetScroll: false,
    });
  }

  return (
    <>
      <SearchResultsPage
        search={search}
        onOpenResearcher={handleOpenResearcher}
        onOpenProduction={handleOpenProduction}
      />
      <ResearcherProfileOverlay
        researcherId={search.researcher}
        search={profileSearch}
        routeSearch={routeSearch}
        onUpdateSearch={handleUpdateProfile}
        onOpenProduction={handleOpenProduction}
        onClose={handleClose}
      />
      <ProductionDetailOverlay
        production={production}
        onClose={handleCloseProduction}
        onContentClick={(event) =>
          interceptResearcherLink(event, (id) =>
            showResearcher(id, null, { replace: false }),
          )
        }
      />
    </>
  );
}
