import {
  createFileRoute,
  useLocation,
  useRouter,
} from '@tanstack/react-router';
import { graduateProgramDetailQueryOptions } from '@/entities/graduate-program/queries';
import {
  decodeProductionRef,
  encodeProductionRef,
  productionRouteParams,
} from '@/entities/production/links';
import type { ProductionKind } from '@/entities/production/model';
import { productionDetailQueryOptions } from '@/entities/production/queries';
import { GraduateProgramDetailPage } from '@/features/graduate-programs/graduate-program-detail-page';
import { graduateProgramDetailSearch } from '@/features/graduate-programs/search';
import { ProductionDetailOverlay } from '@/features/production-detail';

export const Route = createFileRoute('/_public/pos-graduacao/$id')({
  staticData: { crumb: 'Programa de pós-graduação' },
  validateSearch: graduateProgramDetailSearch.schema,
  search: {
    middlewares: graduateProgramDetailSearch.middlewares,
  },
  loaderDeps: ({ search }) => ({ production: search.production }),
  loader: ({ context, params, deps }) => {
    const production = decodeProductionRef(deps.production);
    if (production) {
      void context.queryClient.prefetchQuery(
        productionDetailQueryOptions(production.kind, production.id),
      );
    }
    return context.queryClient.ensureQueryData(
      graduateProgramDetailQueryOptions(params.id),
    );
  },
  component: GraduateProgramDetailRoute,
});

function GraduateProgramDetailRoute() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const openedHere = useLocation({
    select: (location) => Boolean(location.state.productionOverlay),
  });
  const production = decodeProductionRef(search.production);

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
      <GraduateProgramDetailPage
        programId={id}
        search={search}
        onOpenProduction={handleOpenProduction}
      />
      <ProductionDetailOverlay
        production={production}
        onClose={handleCloseProduction}
      />
    </>
  );
}
