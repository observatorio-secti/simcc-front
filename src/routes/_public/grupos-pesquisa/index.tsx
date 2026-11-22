import { createFileRoute, redirect } from '@tanstack/react-router';
import { researchGroupListQueryOptions } from '@/entities/research-group/queries';
import { ResearchGroupsPage } from '@/features/research-groups/research-groups-page';
import { researchGroupsSearch } from '@/features/research-groups/search';
import { firstParam, legacyParams } from '../../-redirects/legacy-params';

export const Route = createFileRoute('/_public/grupos-pesquisa/')({
  staticData: { crumb: 'Grupos de pesquisa' },
  validateSearch: researchGroupsSearch.schema,
  search: {
    middlewares: researchGroupsSearch.middlewares,
  },
  loaderDeps: ({ search }) => ({
    page: search.page,
    per_page: search.per_page,
  }),
  // Legado (V2): `/grupos-pesquisa?group_id=…` abria o grupo.
  beforeLoad: ({ location }) => {
    const id = firstParam(legacyParams(location.search), 'group_id');
    if (id) {
      throw redirect({
        to: '/grupos-pesquisa/$id',
        params: { id },
        search: {},
        replace: true,
      });
    }
  },
  loader: ({ context, deps }) =>
    context.queryClient.prefetchQuery(
      researchGroupListQueryOptions({
        page: deps.page,
        size: deps.per_page,
      }),
    ),
  component: ResearchGroupsPage,
});
