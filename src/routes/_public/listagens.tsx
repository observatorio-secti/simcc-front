import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { listingTabToSearchTab } from '@/features/search';

/**
 * `/listagens` é a `/busca` sem termo (D1.4, ADR 0011). A rota fica para o
 * menu e para os favoritos do legado: redireciona e preserva a aba.
 */
export const Route = createFileRoute('/_public/listagens')({
  validateSearch: z.object({
    tab: z.string().optional().catch(undefined),
  }),
  beforeLoad: ({ search }) => {
    const tab = listingTabToSearchTab(search.tab);
    throw redirect({
      to: '/busca',
      search: tab ? { tab } : {},
      replace: true,
    });
  },
});
