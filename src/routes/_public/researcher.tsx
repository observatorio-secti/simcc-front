import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import {
  firstParam,
  isUuid,
  legacyParams,
  legacyResearcherProfileSearch,
} from '../-redirects/legacy-params';

const LATTES_ID_RE = /^\d{16}$/;

const researcherRedirectSearchSchema = z
  .object({
    name: z.string().optional(),
    researcher_name: z.string().optional(),
    lattes_id: z.string().optional(),
  })
  .passthrough();

/**
 * `/researcher` do legado (V2) → `/pesquisadores/$id`. O legado abria o
 * pesquisador por `id` (UUID), `lattes_id` ou `researcher_name`. Como
 * `GET /v2/researcher/{id}` aceita UUID e `lattes_id`, ambos seguem direto
 * para `/pesquisadores/$id`; URLs legadas apenas com nome seguem para
 * `/busca?q=<nome>&type=name` (sem tentar resolver uma pessoa por nome).
 */
export const Route = createFileRoute('/_public/researcher')({
  validateSearch: researcherRedirectSearchSchema,
  beforeLoad: ({ location }) => {
    const params = legacyParams(location.search);
    const profileSearch = legacyResearcherProfileSearch(params);
    const id = firstParam(params, 'id', 'researcher_id');
    if (id && (isUuid(id) || LATTES_ID_RE.test(id))) {
      throw redirect({
        to: '/pesquisadores/$id',
        params: { id },
        search: profileSearch,
        replace: true,
      });
    }

    const lattesId = firstParam(params, 'lattes_id');
    if (lattesId && LATTES_ID_RE.test(lattesId)) {
      throw redirect({
        to: '/pesquisadores/$id',
        params: { id: lattesId },
        search: profileSearch,
        replace: true,
      });
    }

    const name = firstParam(params, 'researcher_name', 'name');
    if (name) {
      throw redirect({
        to: '/busca',
        search: { q: name, type: 'name' },
        replace: true,
      });
    }

    throw redirect({ to: '/busca', search: {}, replace: true });
  },
});
