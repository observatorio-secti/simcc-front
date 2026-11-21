import { createFileRoute } from '@tanstack/react-router';
import { IncitesPage } from '@/features/incites/incites-page';

export const Route = createFileRoute('/_public/incites')({
  staticData: { crumb: 'Institutos de CT&I' },
  component: IncitesPage,
});
