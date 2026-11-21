import { createFileRoute } from '@tanstack/react-router';
import { ExternalPanelsPage } from '@/features/external-panels/external-panels-page';

export const Route = createFileRoute('/_public/paineis-dados-externos')({
  staticData: { crumb: 'Painéis de dados externos' },
  component: ExternalPanelsPage,
});
