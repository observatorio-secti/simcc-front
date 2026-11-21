import { createFileRoute } from '@tanstack/react-router';
import { researchGroupAllQueryOptions } from '@/entities/research-group/queries';
import { ResearchGroupsPage } from '@/features/research-groups/research-groups-page';
import { researchGroupsSearch } from '@/features/research-groups/search';

export const Route = createFileRoute('/_public/grupos-pesquisa/')({
  staticData: { crumb: 'Grupos de pesquisa' },
  validateSearch: researchGroupsSearch.schema,
  search: {
    middlewares: researchGroupsSearch.middlewares,
  },
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(researchGroupAllQueryOptions()),
  component: ResearchGroupsPage,
});
