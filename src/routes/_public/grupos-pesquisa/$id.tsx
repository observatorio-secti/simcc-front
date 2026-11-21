import { createFileRoute } from '@tanstack/react-router';
import {
  researchGroupDetailQueryOptions,
  researchGroupResearchersQueryOptions,
} from '@/entities/research-group/queries';
import { ResearchGroupDetailPage } from '@/features/research-groups/research-group-detail-page';
import { researchGroupDetailSearch } from '@/features/research-groups/search';

export const Route = createFileRoute('/_public/grupos-pesquisa/$id')({
  staticData: { crumb: 'Detalhe do grupo' },
  validateSearch: researchGroupDetailSearch.schema,
  search: {
    middlewares: researchGroupDetailSearch.middlewares,
  },
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(
        researchGroupDetailQueryOptions(params.id),
      ),
      context.queryClient.prefetchQuery(
        researchGroupResearchersQueryOptions(params.id, { page: 1, size: 100 }),
      ),
    ]);
  },
  component: ResearchGroupDetailPage,
});
