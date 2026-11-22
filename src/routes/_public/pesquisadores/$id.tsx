import {
  createFileRoute,
  notFound,
  stripSearchParams,
  useLocation,
  useRouter,
} from '@tanstack/react-router';
import {
  decodeProductionRef,
  encodeProductionRef,
  productionRefParam,
  productionRouteParams,
} from '@/entities/production/links';
import type { ProductionKind } from '@/entities/production/model';
import { productionDetailQueryOptions } from '@/entities/production/queries';
import {
  researcherDetailQueryOptions,
  researcherTermsQueryOptions,
} from '@/entities/researcher/queries';
import { NotFoundPage } from '@/features/errors/not-found-page';
import { ProductionDetailOverlay } from '@/features/production-detail';
import { researcherScholarshipsQueryOptions } from '@/entities/scholarship/queries';
import { isNotFoundApiError } from '@/features/researcher-profile/queries';
import { ResearcherProfilePage } from '@/features/researcher-profile/researcher-profile-page';
import {
  cleanProfileSearch,
  PROFILE_SEARCH_DEFAULTS,
  researcherProfileSearchSchema,
  type ResearcherProfileSearch,
} from '@/features/researcher-profile/search-schema';

// O estado do perfil (aba, filtros, página) é da feature; a produção aberta
// como overlay (T13) é da rota, que compõe as duas features.
const profileRouteSearchSchema = researcherProfileSearchSchema.extend({
  /** Produção aberta como overlay sobre o perfil (`<kind da v2>:<id>`, ADR 0010). */
  production: productionRefParam,
});

export const Route = createFileRoute('/_public/pesquisadores/$id')({
  staticData: { crumb: 'Pesquisador' },
  validateSearch: profileRouteSearchSchema,
  // Omite os padrões (aba, página, visão) da URL, inclusive na máscara do
  // overlay aberto a partir da busca (ADR 0010).
  search: {
    middlewares: [stripSearchParams(PROFILE_SEARCH_DEFAULTS)],
  },
  loaderDeps: ({ search }) => ({ production: search.production }),
  loader: async ({ context, params, deps }) => {
    const production = decodeProductionRef(deps.production);
    if (production) {
      void context.queryClient.prefetchQuery(
        productionDetailQueryOptions(production.kind, production.id),
      );
    }
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

/**
 * Perfil do pesquisador com a produção como overlay (T13, ADR 0010): abrir
 * uma produção navega para `?production=<kind>:<id>` mascarado como
 * `/producoes/<slug>/<id>`. O perfil continua montado, voltar fecha o
 * overlay e o link copiado abre a página completa da produção.
 */
function ResearcherProfileRoute() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const openedHere = useLocation({
    select: (location) => Boolean(location.state.productionOverlay),
  });
  const production = decodeProductionRef(search.production);

  function handleUpdateSearch(patch: Partial<ResearcherProfileSearch>) {
    void navigate({
      search: (prev) =>
        cleanProfileSearch({ ...prev, ...patch }) as typeof prev,
      replace: true,
    });
  }

  function handleOpenProduction(kind: ProductionKind, itemId: string) {
    const ref = { kind, id: itemId };
    void navigate({
      search: (prev) => ({ ...prev, production: encodeProductionRef(ref) }),
      mask: { to: '/producoes/$kind/$id', params: productionRouteParams(ref) },
      state: (prev) => ({ ...prev, productionOverlay: true }),
      replace: Boolean(search.production),
      resetScroll: false,
    });
  }

  function handleCloseProduction() {
    if (openedHere && router.history.canGoBack()) {
      router.history.back();
      return;
    }
    void navigate({
      search: (prev) => ({ ...prev, production: undefined }),
      state: (prev) => ({ ...prev, productionOverlay: undefined }),
      replace: true,
      resetScroll: false,
    });
  }

  return (
    <>
      <ResearcherProfilePage
        researcherId={id}
        search={search}
        onUpdateSearch={handleUpdateSearch}
        onOpenProduction={handleOpenProduction}
      />
      <ProductionDetailOverlay
        production={production}
        onClose={handleCloseProduction}
      />
    </>
  );
}
