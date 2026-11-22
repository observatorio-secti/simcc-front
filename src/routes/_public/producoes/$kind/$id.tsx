import { createFileRoute, notFound } from '@tanstack/react-router';
import { productionKindFromSlug } from '@/entities/production/links';
import { productionDetailQueryOptions } from '@/entities/production/queries';
import { ErrorPage } from '@/features/errors/error-page';
import { NotFoundPage } from '@/features/errors/not-found-page';
import {
  isProductionNotFoundError,
  ProductionDetailPage,
} from '@/features/production-detail';

// Página completa da produção (T13). O `$kind` é o slug público em pt-BR do
// registro da E2 (`artigo`, `capitulo-de-livro`, `texto-em-revista`…), não o
// tipo da v2. Slug desconhecido ou id inexistente dão 404.
export const Route = createFileRoute('/_public/producoes/$kind/$id')({
  staticData: { crumb: 'Produção' },
  loader: async ({ context, params }) => {
    const kind = productionKindFromSlug(params.kind);
    if (!kind) throw notFound();
    try {
      await context.queryClient.ensureQueryData(
        productionDetailQueryOptions(kind, params.id),
      );
    } catch (error) {
      if (isProductionNotFoundError(error)) throw notFound();
      throw error;
    }
    return { kind };
  },
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
  component: ProductionRoute,
});

function ProductionRoute() {
  const { id } = Route.useParams();
  const { kind } = Route.useLoaderData();
  return <ProductionDetailPage kind={kind} id={id} />;
}
