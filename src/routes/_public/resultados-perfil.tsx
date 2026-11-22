import { createFileRoute, redirect } from '@tanstack/react-router';
import {
  legacyParams,
  legacyResultsToBusca,
} from '../-redirects/legacy-params';

/**
 * `/resultados-perfil` do legado (busca por perfil, V2) → `/busca`, com a
 * mesma tradução de `/resultados` (`legacyResultsToBusca`).
 */
export const Route = createFileRoute('/_public/resultados-perfil')({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: '/busca',
      search: legacyResultsToBusca(legacyParams(location.search)),
      replace: true,
    });
  },
});
