import {
  createFileRoute,
  notFound,
  useLocation,
  useRouter,
} from '@tanstack/react-router';
import { z } from 'zod';
import { addBrowserConversation } from '@/entities/conversation/browser-conversations';
import {
  conversationDetailQueryOptions,
  conversationMessagesQueryOptions,
} from '@/entities/conversation/queries';
import {
  decodeProductionRef,
  encodeProductionRef,
  productionRefParam,
  productionRouteParams,
} from '@/entities/production/links';
import type { ProductionKind } from '@/entities/production/model';
import { productionDetailQueryOptions } from '@/entities/production/queries';
import { NotFoundPage } from '@/features/errors/not-found-page';
import { ConversationPage } from '@/features/maria/conversation-page';
import { conversationParamsSchema } from '@/features/maria/params';
import { ProductionDetailOverlay } from '@/features/production-detail';

const conversationRouteSearchSchema = z.object({
  /** Produção aberta como overlay sobre a conversa (`<kind da v2>:<id>`, ADR 0010). */
  production: productionRefParam,
});

export const Route = createFileRoute('/_public/maria/$conversationId')({
  staticData: { crumb: 'Conversa' },
  validateSearch: conversationRouteSearchSchema,
  loaderDeps: ({ search }) => ({ production: search.production }),
  loader: async ({ context, params, preload, deps }) => {
    if (!conversationParamsSchema.safeParse(params).success) throw notFound();

    const { queryClient } = context;
    const production = decodeProductionRef(deps.production);
    if (production) {
      void queryClient.prefetchQuery(
        productionDetailQueryOptions(production.kind, production.id),
      );
    }
    void queryClient.prefetchQuery(
      conversationMessagesQueryOptions(params.conversationId),
    );
    try {
      await queryClient.ensureQueryData(
        conversationDetailQueryOptions(params.conversationId),
      );
      // Abrir a conversa (inclusive por link) a guarda neste navegador.
      if (!preload) addBrowserConversation(params.conversationId);
    } catch {
      // A página mostra o erro (404: "Conversa não encontrada").
    }
  },
  notFoundComponent: NotFoundPage,
  component: ConversationRoute,
});

function ConversationRoute() {
  const { conversationId } = Route.useParams();
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
      <ConversationPage
        key={conversationId}
        conversationId={conversationId}
        onOpenProduction={handleOpenProduction}
      />
      <ProductionDetailOverlay
        production={production}
        onClose={handleCloseProduction}
      />
    </>
  );
}
