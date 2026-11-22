import { createFileRoute, redirect } from '@tanstack/react-router';
import {
  legacyParams,
  legacyResultsToBusca,
} from '../-redirects/legacy-params';

/**
 * `/resultados` do legado (V2) → `/busca`, com termo, tipo, aba, filtros,
 * anos e ordenação traduzidos (`legacyResultsToBusca`).
 */
export const Route = createFileRoute('/_public/resultados')({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: '/busca',
      search: legacyResultsToBusca(legacyParams(location.search)),
      replace: true,
    });
  },
});
