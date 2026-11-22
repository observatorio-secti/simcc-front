import { createFileRoute, redirect } from '@tanstack/react-router';
import { researcherListQueryOptions } from '@/entities/researcher/queries';
import {
  firstParam,
  isUuid,
  legacyParams,
  legacyResearcherProfileSearch,
  matchByName,
} from '../-redirects/legacy-params';

/**
 * `/researcher` do legado (V2) → `/pesquisadores/$id`. O legado abria o
 * pesquisador por `researcher_name` (links e compartilhamento) ou
 * `lattes_id`. O nome é resolvido em `/v2/researcher?search_in=name`; sem
 * correspondência exata, cai na busca por nome. A v2 não procura por Lattes:
 * `lattes_id` sem nome vai para `/busca`.
 */
export const Route = createFileRoute('/_public/researcher')({
  beforeLoad: async ({ context, location }) => {
    const params = legacyParams(location.search);
    const profileSearch = legacyResearcherProfileSearch(params);
    const id = firstParam(params, 'id', 'researcher_id');
    if (id && isUuid(id)) {
      throw redirect({
        to: '/pesquisadores/$id',
        params: { id },
        search: profileSearch,
        replace: true,
      });
    }

    const name = firstParam(params, 'researcher_name', 'name');
    if (!name) {
      throw redirect({ to: '/busca', search: {}, replace: true });
    }

    const found = await context.queryClient
      .fetchQuery(
        researcherListQueryOptions({
          q: name,
          search_in: 'name',
          per_page: 10,
        }),
      )
      .then((response) => matchByName(response.data, name))
      .catch(() => undefined);

    if (found) {
      throw redirect({
        to: '/pesquisadores/$id',
        params: { id: found.id },
        search: profileSearch,
        replace: true,
      });
    }
    throw redirect({
      to: '/busca',
      search: { q: name, type: 'name' },
      replace: true,
    });
  },
});
