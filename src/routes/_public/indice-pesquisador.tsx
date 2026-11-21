import { createFileRoute } from '@tanstack/react-router';
import { ResearcherIndexPage } from '@/features/researcher-index';

export const Route = createFileRoute('/_public/indice-pesquisador')({
  staticData: { crumb: 'Índice do pesquisador' },
  head: () => ({
    meta: [{ title: 'Índice do pesquisador | Simcc' }],
  }),
  component: ResearcherIndexPage,
});
